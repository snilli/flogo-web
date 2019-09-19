import { injectable } from 'inversify';
import { Logger } from 'winston';
import { EngineProcess } from './engine-process';
import { setupStdioRedirection } from './logging';
import { RunningChildProcess } from './running-child-process';

@injectable()
export class StreamRunnerProcess extends EngineProcess {
  private internalAppJsonPath: string;

  constructor(logger?: Logger) {
    super({
      resolveEnv: () => this.resolveStreamEnv(),
      afterStart: ({ subprocess }: { subprocess: RunningChildProcess }) => {
        // uncomment to log directly to console
        // subprocess.stdout.on('data', data =>
        //   console.log(`[stream-runner]`, data.toString())
        // );
        // subprocess.stderr.on('data', data =>
        //   console.error(`[stream-runner]`, data.toString())
        // );
        setupStdioRedirection(subprocess, 'stream-engine', {
          logger,
        });
      },
    });
  }

  setAppJsonPath(appJsonPath: string) {
    this.internalAppJsonPath = appJsonPath;
  }

  getAppJsonPath() {
    return this.internalAppJsonPath;
  }

  isRunning() {
    return this.currentProcess && !this.currentProcess.closed;
  }

  getCurrentChildProcess() {
    return this.currentProcess;
  }

  private resolveStreamEnv(): { [key: string]: any } {
    return {
      FLOGO_CONFIG_PATH: this.getAppJsonPath(),
    };
  }
}
