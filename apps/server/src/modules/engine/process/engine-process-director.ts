import { ChildProcess } from 'child_process';
import { injectable } from 'inversify';
import { RunningChildProcess } from './running-child-process';
import { EngineProjectDetails } from '../engine';
import { execEngine } from './exec-controller';

class ProcessWrapper {
  constructor(
    public childProcess: RunningChildProcess,
    public hooks: EngineProcessConfig
  ) {}
}

interface EngineProcessConfig {
  engineDetails: EngineProjectDetails;
  resolveEnv?: () => { [key: string]: string };
  beforeStart?: () => any;
  afterStart?: (instance: RunningChildProcess) => any;
  afterStop?: (exitCode: number, instance: RunningChildProcess) => any;
}

@injectable()
export class EngineProcessDirector {
  private currentProcess: ProcessWrapper;

  isAnyProcessRunning() {
    return this.currentProcess && !this.currentProcess.childProcess.closed;
  }

  isProcessStillRunning(process: ChildProcess) {
    // todo is there a better way to check for process equality like using pid?
    return this.isAnyProcessRunning() && this.currentProcess.childProcess === process;
  }

  acquire(config: EngineProcessConfig) {
    if (!this.currentProcess || this.currentProcess.childProcess.closed) {
      const engineDetails = config.engineDetails;
      const childProcess = execEngine(engineDetails.path, engineDetails.executableName, {
        binDir: engineDetails.binDir,
        env: config.resolveEnv ? config.resolveEnv() : {},
      });
      this.currentProcess = new ProcessWrapper(childProcess, config);
      if (config.afterStart) {
        config.afterStart(childProcess);
      }
      childProcess.whenClosed.then(exitCode => {
        if (exitCode !== 0) {
          console.warn(
            `Warning: Engine process exited with non zero code. Exit code: ${exitCode}`
          );
        }
        if (config.afterStop) {
          config.afterStop(exitCode, childProcess);
        }
      });
    }
    return this.currentProcess.childProcess;
  }

  kill(): Promise<number> {
    if (!this.currentProcess) {
      return Promise.resolve(0);
    }
    const childProcess = this.currentProcess.childProcess;
    if (!childProcess.closed) {
      childProcess.kill();
    }
    return childProcess.whenClosed;
  }
}
