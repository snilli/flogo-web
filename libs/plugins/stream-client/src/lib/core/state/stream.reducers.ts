import { INITIAL_STREAM_STATE, FlogoStreamState } from './stream.state';
import { StreamActionsUnion, StreamActionType } from './stream.actions';

export function streamReducer(state: FlogoStreamState = INITIAL_STREAM_STATE, action: StreamActionsUnion): FlogoStreamState {
  switch (action.type) {
    case StreamActionType.Init:
      return {
        ...INITIAL_STREAM_STATE,
        ...action.payload
      }
  }
  return state;
}
