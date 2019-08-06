import { Component, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DiagramGraph, SingleEmissionSubject } from '@flogo-web/lib-client/core';
import {
  DiagramAction,
  DiagramActionType,
  DiagramActionChild,
  DiagramSelection,
  DiagramActionSelf,
} from '@flogo-web/lib-client/diagram';

import {
  StreamStoreState,
  selectGraph,
  StreamDiagramActions,
  getDiagramSelection,
} from '../core/state';

@Component({
  selector: 'flogo-stream-diagram',
  templateUrl: './stream-diagram.component.html',
  styleUrls: ['./stream-diagram.component.less'],
})
export class StreamDiagramComponent implements OnDestroy {
  items$: Observable<DiagramGraph>;
  currentSelection$: Observable<DiagramSelection>;
  private ngOnDestroy$ = SingleEmissionSubject.create();

  constructor(private store: Store<StreamStoreState>) {
    this.items$ = this.store.pipe(
      select(selectGraph),
      takeUntil(this.ngOnDestroy$)
    );
    this.currentSelection$ = this.store.pipe(
      select(getDiagramSelection),
      takeUntil(this.ngOnDestroy$)
    );
  }

  ngOnDestroy(): void {
    this.ngOnDestroy$.emitAndComplete();
  }

  onDiagramAction(action: DiagramAction) {
    switch (action.type) {
      case DiagramActionType.Insert:
        this.store.dispatch(
          new StreamDiagramActions.SelectCreateStage(
            (<DiagramActionChild>action).parentId
          )
        );
        break;
      case DiagramActionType.Remove:
        this.store.dispatch(
          new StreamDiagramActions.SelectRemoveStage((<DiagramActionSelf>action).id)
        );
        break;
      case DiagramActionType.Select:
        this.store.dispatch(
          new StreamDiagramActions.SelectStage((<DiagramActionSelf>action).id)
        );
        break;
      case DiagramActionType.Configure:
        // streams-plugin-todo: implement the logic to allow user to configure the stages
        break;
    }
  }
}
