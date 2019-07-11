import { Action } from '@ngrx/store';
import { FlogoStreamState } from './stream.state';

export enum StreamActionType {
  Init = '[Stream] Init',
}

interface BaseStreamAction extends Action {
  readonly type: StreamActionType;
}

export class Init implements BaseStreamAction {
  readonly type = StreamActionType.Init;
  constructor(public payload: FlogoStreamState) {}
}

export type StreamActionsUnion = Init;
