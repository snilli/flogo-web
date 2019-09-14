import { URL } from 'url';
import { tmpdir } from 'os';
import { join } from 'path';
import { injectable, inject } from 'inversify';
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
}

const TMP_PATH = join(tmpdir(), 'stream-simulating-app.json');

@injectable()
export class SimulationPreparer {
  constructor(
    @inject(TOKENS.EngineProvider) private engineProvider: () => Promise<Engine>,
    private simulatableAppGenerator: SimulatableAppGenerator,
    @inject(TOKENS.StreamSimulationConfig) private config: SimulationConfiguration
  ) {}

  async prepare({
    pipelineId,
    simulationDataFile,
  }: PrepareOptions): Promise<RemoteSimulatorProcess> {
    const { restControlUrl, wsUrl } = this.config;
    const parsedRestUrl = new URL(restControlUrl);
    const flogoJson = this.simulatableAppGenerator.generateFor(pipelineId, {
      filePath: simulationDataFile,
      port: parsedRestUrl.port,
    });
    await writeJSONFile(TMP_PATH, flogoJson);
    const remoteSimulatorProcess = new RemoteSimulatorProcess({
      restControlUrl: restControlUrl,
      wsUrl: wsUrl,
    });
    const engineProcess = new StreamRunnerProcess();
    const engine = await this.engineProvider();
    engineProcess.start(engine.getProjectDetails());
    remoteSimulatorProcess.setup(engineProcess);
    return remoteSimulatorProcess;
  }
}
