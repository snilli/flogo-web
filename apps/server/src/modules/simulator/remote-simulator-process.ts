import got from 'got';
import Websocket from 'ws';
import { StreamRunnerProcess } from '../engine/process/stream-runner-process';

export type RemoteProcessFactoryFn = () => RemoteSimulatorProcess;

type ListenerFn = (data) => any;
const NO_OP: ListenerFn = () => {};

export enum ProcessStatus {
  New = 'new',
  Running = 'running',
  Paused = 'paused',
  Closed = 'closed',
  Errored = 'errored',
}

export class RemoteSimulatorProcess {
  private _status: ProcessStatus = ProcessStatus.New;
  private dataSubscription: (data) => any = NO_OP;
  private statusSubscription: (data) => any = NO_OP;
  private subprocess: StreamRunnerProcess;
  private ws: Websocket;

  constructor(
    private config: {
      wsUrl: string;
      restControlUrl: string;
    }
  ) {}

  isConnected() {
    return this.subprocess.isRunning();
  }

  get status() {
    return this._status;
  }

  async restart() {
    return this.callRestControl('restart', ProcessStatus.Running);
  }

  async pause() {
    return this.callRestControl('pause', ProcessStatus.Paused);
  }

  async resume() {
    return this.callRestControl('resume', ProcessStatus.Running);
  }

  setup(subprocess: StreamRunnerProcess) {
    this.subprocess = subprocess;
    this.updateStatus(
      this.subprocess.isRunning() ? ProcessStatus.Running : ProcessStatus.Closed
    );
    this.subprocess.getCurrentChildProcess().whenClosed.then(exitCode => {
      this.updateStatus(exitCode === 0 ? ProcessStatus.Closed : ProcessStatus.Errored);
    });
    setImmediate(() => {
      this.ws = new Websocket(this.config.wsUrl);
      this.ws.on('message', this.dataSubscription);
    });
  }

  teardown() {
    if (this.subprocess && this.subprocess.isRunning()) {
      this.subprocess.stop();
    }

    if (
      this.ws.readyState === Websocket.OPEN ||
      this.ws.readyState === Websocket.CONNECTING
    ) {
      this.ws.close();
    }

    this.dataSubscription = NO_OP;
    this.statusSubscription = NO_OP;
  }

  onData(fn: ListenerFn) {
    this.dataSubscription = fn;
  }

  onStatusChange(fn: ListenerFn) {
    this.statusSubscription = fn;
  }

  private updateStatus(newStatus: ProcessStatus) {
    this._status = newStatus;
    if (this.statusSubscription) {
      this.statusSubscription(this._status);
    }
  }

  private callRestControl(action: string, statusIfSuccess: ProcessStatus) {
    this.throwIfProcessUnavailable(action);
    return got(`${this.config.restControlUrl}/${action}`).then(r => {
      this.updateStatus(statusIfSuccess);
      return r;
    });
  }

  private throwIfProcessUnavailable(action: string) {
    if (!this.subprocess) {
      throw new Error(
        `Simulator process: Cannot ${action}! Process not found, probably was never bootstrapped`
      );
    }

    if (!this.subprocess.isRunning()) {
      throw new Error(
        `Simulator process: Cannot ${action}! Process is not available (probably already closed or errored)`
      );
    }
  }
}
