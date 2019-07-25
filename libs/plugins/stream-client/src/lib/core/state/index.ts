import { Action, ActionReducer } from '@ngrx/store';
import { FlogoStreamState, INITIAL_STREAM_STATE } from './stream.state';
import { streamReducer } from './stream.reducers';
import { triggersReducer } from './triggers/triggers.reducer';

const reducers: ActionReducer<FlogoStreamState, Action>[] = [
  streamReducer,
  triggersReducer,
];
export function featureReducer(state = INITIAL_STREAM_STATE, action: Action) {
  return reducers.reduce((nextState, reducer) => reducer(nextState, action), state);
}

export * from './stream.state';
export * from './stream.actions';
export * from './stream.reducers';
export * from './stream.selectors';

import * as TriggerActions from './triggers/triggers.actions';
export { TriggerActions };
