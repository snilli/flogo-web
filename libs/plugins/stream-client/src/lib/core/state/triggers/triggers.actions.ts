import { Action } from '@ngrx/store';
import { TriggerHandler, Trigger } from '@flogo-web/lib-client/core';

export enum TriggerActionType {
  AddTrigger = '[Stream][Trigger] Add trigger',
  RemoveHandler = '[Stream][Trigger] Remove handler',
}

export class RemoveHandler implements Action {
  readonly type = TriggerActionType.RemoveHandler;
  constructor(public payload: string) {}
}

export class AddTrigger implements Action {
  readonly type = TriggerActionType.AddTrigger;
  constructor(public payload: { trigger: Trigger; handler: TriggerHandler }) {}
}

export type TriggerActionsUnion = AddTrigger | RemoveHandler;
