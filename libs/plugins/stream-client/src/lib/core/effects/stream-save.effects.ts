import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { switchMap, filter, map } from 'rxjs/operators';
import { Action } from '@ngrx/store';

import { StreamService } from '../stream.service';
import { StreamSaveSuccess, StreamActionType } from '../state';

@Injectable()
export class StreamSaveEffects {
  @Effect()
  saveStream$: Observable<Action> = this.actions$.pipe(
    ofType(StreamActionType.ChangeName, StreamActionType.ChangeDescription),
    switchMap(() => this.saveFlow()),
    filter(isSaved => isSaved),
    map(() => new StreamSaveSuccess())
  );

  constructor(private streamOps: StreamService, private actions$: Actions) {}

  private saveFlow() {
    return this.streamOps.saveStream();
  }
}
