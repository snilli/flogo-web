import { Action } from '@ngrx/store';
import { FlogoStreamState } from './stream.state';

export enum StreamActionType {
  Init = '[Stream] Init',
  ChangeName = '[Stream] Name changed',
  ChangeDescription = '[Stream] Name changed',
  StreamSaveSuccess = '[Stream] Save success',
}

interface BaseStreamAction extends Action {
  readonly type: StreamActionType;
}

export class Init implements BaseStreamAction {
  readonly type = StreamActionType.Init;
  constructor(public payload: FlogoStreamState) {}
}

export class ChangeName implements BaseStreamAction {
  readonly type = StreamActionType.ChangeName;
  constructor(public payload: string) {}
}

export class ChangeDescription implements BaseStreamAction {
  readonly type = StreamActionType.ChangeDescription;
  constructor(public payload: string) {}
}

export class StreamSaveSuccess implements BaseStreamAction {
  readonly type = StreamActionType.StreamSaveSuccess;
}

export type StreamActionsUnion =
  | Init
  | ChangeName
  | ChangeDescription
  | StreamSaveSuccess;
