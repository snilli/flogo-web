import * as selectionFactory from '../models/stream/selection';
import { INITIAL_STREAM_STATE, FlogoStreamState } from './stream.state';
import { StreamActionsUnion, StreamActionType } from './stream.actions';
import { removeStage } from './cases/remove-stage';
import { stageItemCreated } from './cases/stage-item-created';
import { SelectionType } from '../models/selection';

export function streamReducer(
  state: FlogoStreamState = INITIAL_STREAM_STATE,
  action: StreamActionsUnion
): FlogoStreamState {
  switch (action.type) {
    case StreamActionType.Init:
      return {
        ...INITIAL_STREAM_STATE,
        ...action.payload,
      };
    case StreamActionType.ChangeName:
    case StreamActionType.RevertName:
      return {
        ...state,
        name: action.payload,
      };
    case StreamActionType.ChangeDescription:
      return {
        ...state,
        description: action.payload,
      };
    case StreamActionType.SelectCreateStage:
      return {
        ...state,
        currentSelection: selectionFactory.makeInsertSelection(action.payload),
      };
    case StreamActionType.StageItemCreated:
      return stageItemCreated(state, action.payload);
    case StreamActionType.CancelCreateStage:
      const selection = state.currentSelection;
      if (
        selection &&
        selection.type === SelectionType.InsertTask &&
        selection.parentId === action.payload
      ) {
        return {
          ...state,
          currentSelection: null,
        };
      }
      return state;
    case StreamActionType.SelectStage:
      return {
        ...state,
        currentSelection: selectionFactory.makeStageSelection(action.payload),
      };
    case StreamActionType.DeleteStage:
      return removeStage(state, action.payload);
  }
  return state;
}
