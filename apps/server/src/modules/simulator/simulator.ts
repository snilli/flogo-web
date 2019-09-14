import {
  RemoteSimulatorProcess,
  RemoteProcessFactoryFn,
  ProcessStatus,
} from './remote-simulator-process';
import { Socket } from 'socket.io';
import { SimulationPreparer } from './simulation-preparer';
import { injectable } from 'inversify';

export interface SimulationAction {
  type: 'start' | 'restart' | 'resume' | 'pause' | 'stop';
  data?: any;
}

export class SimulationClient {
  private simulator: StreamSimulator;

  constructor(private socket: Socket) {
    socket.on('disconnect', () => {
      this.socket = null;
      if (this.simulator) {
        this.simulator.onClientDisconnection(this);
      }
    });

    socket.on('simulator-action', (action: SimulationAction) => {
      if (!this.simulator) {
        return;
      }

      switch (action.type) {
        case 'start':
          this.simulator.start(action.data);
          break;
        case 'pause':
          this.simulator.pause();
          break;
        case 'resume':
          this.simulator.resume();
          break;
        case 'restart':
          this.simulator.restart();
          break;
      }
    });
  }

  send(data: any) {
    this.socket.send(data);
  }

  emitStatus(status) {
    this.socket.emit('simulator-status', status);
  }

  register(simulator: StreamSimulator) {
    this.simulator = simulator;
  }

  unregister(simulator: StreamSimulator) {
    if (this.simulator === simulator) {
      this.simulator = null;
    }
  }

  disconnect() {
    this.socket.disconnect();
  }
}

@injectable()
export class StreamSimulator {
  private currentClient: SimulationClient;
  private currentProcess: RemoteSimulatorProcess;

  constructor(private enginePreparer: SimulationPreparer) {}

  updateClient(client: SimulationClient) {
    if (this.currentClient) {
      this.currentClient.unregister(this);
      this.currentClient.disconnect();
    }
    this.currentClient = client;
    this.currentClient.register(this);
  }

  async startNewProcess({ pipelineId, simulationDataFile }) {
    this.teardownRemoteProcess();

    this.currentProcess = await this.enginePreparer.prepare({
      pipelineId,
      simulationDataFile,
    });
    this.currentProcess.onData(this.sendToClient.bind(this));
  }

  onClientDisconnection(client: SimulationClient) {
    if (this.currentClient === client) {
      this.currentClient.unregister(this);
      this.currentClient = null;

      this.teardownRemoteProcess();
      this.currentProcess = null;
    }
  }

  start({ pipelineId, simulationDataFile }) {
    this.startNewProcess({ pipelineId, simulationDataFile });
  }

  pause() {
    this.currentProcess.pause();
  }

  resume() {
    this.currentProcess.resume();
  }

  stop() {
    this.teardownRemoteProcess();
  }

  restart() {
    this.currentProcess.restart();
  }

  private teardownRemoteProcess() {
    if (this.currentProcess) {
      this.currentProcess.teardown();
    }
  }

  private sendToClient(data) {
    if (this.currentClient) {
      this.currentClient.send(data);
    }
  }

  private emitStatus(status: ProcessStatus) {
    if (this.currentClient) {
      this.currentClient.emitStatus(status);
    }
  }
}
