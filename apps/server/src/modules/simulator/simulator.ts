import { RemoteSimulatorProcess } from './remote-simulator-process';
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
        case 'stop':
          this.simulator.stop();
          break;
      }
    });
  }

  send(data: any) {
    this.socket.emit('data', data);
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

  async startNewProcess({ pipelineId, simulationDataFile, mappingsType }) {
    console.log('simulator: starting new process', {
      pipelineId,
      simulationDataFile,
      mappingsType,
    });
    this.teardownRemoteProcess();

    this.currentProcess = await this.enginePreparer.prepare({
      pipelineId,
      simulationDataFile,
      mappingsType,
      events: {
        onData: this.sendData.bind(this),
        onStatusChange: this.sendStatus.bind(this),
      },
    });
    await this.currentProcess.start().catch(error => {
      console.warn('Error starting simulator', error);
      this.stop();
    });
  }

  onClientDisconnection(client: SimulationClient) {
    if (this.currentClient === client) {
      console.log('simulator: client disconnected');
      this.currentClient.unregister(this);
      this.currentClient = null;

      this.teardownRemoteProcess();
      this.currentProcess = null;
    }
  }

  start({ pipelineId, simulationDataFile, mappingsType }) {
    this.startNewProcess({ pipelineId, simulationDataFile, mappingsType });
  }

  pause() {
    console.log('simulator: pausing');
    this.currentProcess.pause();
  }

  resume() {
    console.log('simulator: resuming');
    this.currentProcess.resume();
  }

  stop() {
    console.log('simulator: stopping');
    this.teardownRemoteProcess();
  }

  restart() {
    console.log('simulator: restarting');
    this.currentProcess.restart();
  }

  private teardownRemoteProcess() {
    if (this.currentProcess) {
      this.currentProcess.teardown();
    }
  }

  private sendData(data) {
    if (this.currentClient) {
      console.log('sending data to client', data);
      this.currentClient.send(data);
    }
  }

  private sendStatus(status) {
    if (this.currentClient) {
      console.log('sending status to client', status);
      this.currentClient.emitStatus(status);
    }
  }
}
