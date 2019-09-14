import { RunningChildProcess } from './running-child-process';
import { EngineProjectDetails } from '../engine';
import { execEngine } from './exec-controller';
import { unmanaged, injectable } from 'inversify';

export type AfterStartFn = (
  params: { subprocess: RunningChildProcess; projectDetails: EngineProjectDetails }
) => any;

export type EnvResolverFn = () => { [key: string]: any };

@injectable()
export class EngineProcess {
  protected currentProcess: RunningChildProcess;
  private afterStart: AfterStartFn;
  private resolveEnv: EnvResolverFn;

  constructor(
    @unmanaged() hooks: { afterStart?: AfterStartFn; resolveEnv?: EnvResolverFn } = {}
  ) {
    this.afterStart = hooks.afterStart || (() => {});
    this.resolveEnv = hooks.resolveEnv || (() => ({}));
  }

  start(engineDetails: EngineProjectDetails) {
    if (!this.currentProcess || this.currentProcess.closed) {
      this.currentProcess = execEngine(engineDetails.path, engineDetails.executableName, {
        binDir: engineDetails.binDir,
        env: this.resolveEnv(),
      });
      this.afterStart({
        subprocess: this.currentProcess,
        projectDetails: engineDetails,
      });
    }
    this.currentProcess.whenClosed.then(exitCode => {
      if (exitCode !== 0) {
        console.warn(
          `Warning: Engine process exited with non zero code. Exit code: ${exitCode}`
        );
      }
    });
    return this.currentProcess;
  }

  stop() {
    if (this.currentProcess && !this.currentProcess.closed) {
      this.currentProcess.kill();
    }
    return this.currentProcess ? this.currentProcess.whenClosed : Promise.resolve();
  }
}
