import * as io from 'socket.io-client';
import { Observable, fromEvent } from 'rxjs';

import { Injectable, OnDestroy, Inject } from '@angular/core';
import { HOSTNAME } from '@flogo-web/lib-client/core';

export type SimulationActionType = 'start' | 'restart' | 'resume' | 'pause' | 'stop';

export interface PipelineData {
  type: PipelineEventType;
  pipelineId: string;
  instanceId: string;
  stageId?: string;
  data: object;
}

export enum PipelineEventType {
  PipelineStarted = 'pipeline-started',
  PipelineFinished = 'pipeline-finished',
  StageStarted = 'stage-started',
  StageFinished = 'stage-finished',
}

const PIPELINE_KEY = '::pipeline::';

interface DataBuffer {
  [id: string]: {
    started: PipelineData[];
    finished: PipelineData[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class SimulatorService implements OnDestroy {
  private readonly socket: SocketIOClient.Socket;
  public readonly data$: Observable<any>;
  public readonly status$: Observable<any>;
  private data: DataBuffer = {};

  constructor(@Inject(HOSTNAME) hostname: string) {
    this.socket = io.connect(`${hostname}/stream-simulator`);
    this.data$ = fromEvent(this.socket, 'data')
      .pipe
      // map((data: PipelineData) => {
      //   switch (data.type) {
      //     case PipelineEventType.PipelineStarted:
      //       this.getBuffer(PIPELINE_KEY).started.push(data);
      //       break;
      //     case PipelineEventType.PipelineFinished:
      //       this.getBuffer(PIPELINE_KEY).finished.push(data);
      //       break;
      //     case PipelineEventType.StageStarted:
      //       this.getBuffer(data.stageId).started.push(data);
      //       break;
      //     case PipelineEventType.StageFinished:
      //       this.getBuffer(data.stageId).finished.push(data);
      //       break;
      //   }
      // })
      ();
    this.status$ = fromEvent(this.socket, 'simulator-status');
  }

  ngOnDestroy() {
    console.log('disconnecting');
    this.socket.disconnect();
  }

  start(pipelineId: string, simulationDataFile: string) {
    this.emitAction('start', { pipelineId, simulationDataFile });
  }

  stop() {
    this.emitAction('stop');
  }

  pause() {
    this.emitAction('pause');
  }

  resume() {
    this.emitAction('resume');
  }

  private getBuffer(id: string) {
    let buffer = this.data[id];
    if (!buffer) {
      buffer = {
        started: [],
        finished: [],
      };
      this.data[id] = buffer;
    }
    return buffer;
  }

  private emitAction(type: SimulationActionType, data?: any) {
    this.socket.emit('simulator-action', {
      type,
      data,
    });
  }
}
