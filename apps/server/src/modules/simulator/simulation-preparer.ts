import { URL } from 'url';
import { tmpdir } from 'os';
import { join } from 'path';
import { injectable, inject } from 'inversify';

import { SimulationInputMapping } from '@flogo-web/core';

import { Engine } from '../engine';
import { TOKENS } from '../../core';
import { writeJSONFile } from '../../common/utils/file';
import { RemoteSimulatorProcess } from './remote-simulator-process';
import { StreamRunnerProcess } from '../engine/process/stream-runner-process';
import { SimulatableAppGenerator } from './simulatable-app-generator';
import { SimulationConfiguration } from './simulation-config';

export interface PrepareOptions {
  pipelineId: string;
  simulationDataFile: string;
  mappingsType: SimulationInputMapping;
  events: {
    onData: (data) => any;
    onStatusChange: (status) => any;
  };
}

const TMP_PATH = join(tmpdir(), 'stream-simulating-app.json');

@injectable()
export class SimulationPreparer {
  constructor(
    @inject(TOKENS.EngineProvider) private engineProvider: () => Promise<Engine>,
    private simulatableAppGenerator: SimulatableAppGenerator,
    @inject(TOKENS.StreamSimulationConfig) private config: SimulationConfiguration,
    @inject(TOKENS.EngineLogger) private engineLogger
  ) {}

  async prepare({
    pipelineId,
    simulationDataFile,
    mappingsType,
    events,
  }: PrepareOptions): Promise<RemoteSimulatorProcess> {
    const { restControlUrl, wsUrl } = this.config;
    const parsedRestUrl = new URL(restControlUrl);
    const flogoJson = await this.simulatableAppGenerator.generateFor(pipelineId, {
      filePath: simulationDataFile,
      port: parsedRestUrl.port,
      mappingsType,
    });
    console.log(TMP_PATH);
    await writeJSONFile(TMP_PATH, flogoJson);
    const remoteSimulatorProcess = new RemoteSimulatorProcess({
      restControlUrl: restControlUrl,
      wsUrl: wsUrl,
    });
    remoteSimulatorProcess.onStatusChange(events.onStatusChange);
    remoteSimulatorProcess.onData(events.onData);
    const engineProcess = new StreamRunnerProcess(this.engineLogger);
    engineProcess.setAppJsonPath(TMP_PATH);
    const engine = await this.engineProvider();
    engineProcess.start(engine.getProjectDetails());
    remoteSimulatorProcess.setup(engineProcess);
    return remoteSimulatorProcess;
  }
}
