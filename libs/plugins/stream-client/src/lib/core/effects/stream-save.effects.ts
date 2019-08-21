import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { switchMap, filter, map } from 'rxjs/operators';
import { Action } from '@ngrx/store';

import { StreamService } from '../stream.service';
import { StreamDiagramActions, StreamActionType } from '../state';

@Injectable()
export class StreamSaveEffects {
  @Effect()
  saveStreamName$: Observable<Action> = this.actions$.pipe(
    ofType(StreamActionType.ChangeName),
    switchMap(() => this.streamOps.saveStreamName()),
    filter(isSaved => isSaved),
    map(() => new StreamDiagramActions.StreamSaveSuccess())
  );

  @Effect()
  saveStream$: Observable<Action> = this.actions$.pipe(
    ofType(
      StreamActionType.ChangeDescription,
      StreamActionType.DeleteStage,
      StreamActionType.UpdateMetadata,
      StreamActionType.StageItemCreated
    ),
    switchMap(action => this.saveStream(action)),
    filter(isSaved => isSaved),
    map(() => new StreamDiagramActions.StreamSaveSuccess())
  );

  @Effect()
  deleteStage$: Observable<Action> = this.actions$.pipe(
    ofType(StreamActionType.SelectRemoveStage),
    switchMap((action: StreamDiagramActions.SelectRemoveStage) =>
      this.showDeleteMessage(action.payload)
    ),
    map(removeItemId => new StreamDiagramActions.ConfirmDeleteStage(removeItemId))
  );

  constructor(private streamOps: StreamService, private actions$: Actions) {}

  private saveStream(action?: Action) {
    return this.streamOps.saveStream(action);
  }

  private showDeleteMessage(itemId) {
    return this.streamOps.getDeleteStageConfirmation(itemId);
  }
}
