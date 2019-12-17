import { Logger } from 'winston';
import { setupStdioRedirection } from './logging';
import { EngineProcessDirector } from './engine-process-director';
import { RunningChildProcess } from './running-child-process';
import { EngineProjectDetails } from '../engine';

export class FlowRunnerProcess {
  public whenStarted: Promise<void>;
  private currentProcess: RunningChildProcess;
  private notifyStarted: () => void;

  constructor(
    private engineProcessDirector: EngineProcessDirector,
    private logger?: Logger
  ) {
    this.whenStarted = new Promise(resolve => {
      this.notifyStarted = () => resolve();
    });
  }

  start(engineDetails: EngineProjectDetails) {
    return this.engineProcessDirector.acquire({
      engineDetails,
      afterStart: (subprocess: RunningChildProcess) =>
        this.afterStart(subprocess, engineDetails),
      afterStop: () => {
        this.currentProcess = null;
      },
    });
  }

  stop() {
    if (!this.currentProcess) {
      return Promise.resolve(0);
    }
    if (this.engineProcessDirector.isProcessStillRunning(this.currentProcess)) {
      this.engineProcessDirector.kill();
    }
    return this.currentProcess.whenClosed;
  }

  afterStart(subprocess: RunningChildProcess, projectDetails: EngineProjectDetails) {
    this.currentProcess = subprocess;
    // uncomment to log directly to console
    // subprocess.stdout.on('data', data =>
    //   console.log(`[stream-runner]`, data.toString())
    // );
    // subprocess.stderr.on('data', data =>
    //   console.error(`[stream-runner]`, data.toString())
    // );
    setupStdioRedirection(subprocess, projectDetails.projectName, {
      logger: this.logger,
    });
    this.notifyStarted();
  }
}
