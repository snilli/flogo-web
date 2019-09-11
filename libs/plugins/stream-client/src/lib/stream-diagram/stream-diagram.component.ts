import { Component, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  DiagramGraph,
  SingleEmissionSubject,
  NodeType,
} from '@flogo-web/lib-client/core';
import {
  DiagramAction,
  DiagramActionType,
  DiagramActionChild,
  DiagramSelection,
  DiagramActionSelf,
  Tile,
  TaskTile,
  TileType,
  trackTileByFn,
  InsertTile,
} from '@flogo-web/lib-client/diagram';

import {
  StreamStoreState,
  selectGraph,
  StreamDiagramActions,
  getDiagramSelection,
  getStagesAsTiles,
} from '../core/state';

@Component({
  selector: 'flogo-stream-diagram',
  templateUrl: './stream-diagram.component.html',
  styleUrls: ['./stream-diagram.component.less'],
})
export class StreamDiagramComponent implements OnDestroy {
  items$: Observable<DiagramGraph>;
  currentSelection: DiagramSelection;
  tiles: Tile[];
  // by default should be the root tile
  insertTile: InsertTile;
  tileTypes = TileType;
  nodeTypes = NodeType;
  trackTileBy = trackTileByFn;
  private ngOnDestroy$ = SingleEmissionSubject.create();

  constructor(private store: Store<StreamStoreState>) {
    this.items$ = this.store.pipe(
      select(selectGraph),
      takeUntil(this.ngOnDestroy$)
    );
    this.store
      .pipe(
        select(getDiagramSelection),
        takeUntil(this.ngOnDestroy$)
      )
      .subscribe(currentSelection => {
        this.currentSelection = currentSelection;
      });

    this.store
      .pipe(
        select(getStagesAsTiles),
        takeUntil(this.ngOnDestroy$)
      )
      .subscribe((streamTiles: TaskTile[]) => {
        this.tiles = streamTiles;
        const lastTile = streamTiles[streamTiles.length - 1];
        this.insertTile = {
          type: TileType.Insert,
          parentId: lastTile ? lastTile.task.id : null,
          isRoot: !lastTile,
        };
      });
  }

  ngOnDestroy(): void {
    this.ngOnDestroy$.emitAndComplete();
  }

  onDiagramAction(action: DiagramAction) {
    switch (action.type) {
      case DiagramActionType.Remove:
        this.store.dispatch(
          new StreamDiagramActions.SelectRemoveStage((<DiagramActionSelf>action).id)
        );
        break;
      case DiagramActionType.Configure:
        this.store.dispatch(
          new StreamDiagramActions.ConfigureStage({
            itemId: (<DiagramActionSelf>action).id,
          })
        );
        break;
    }
  }
  addStage() {
    this.store.dispatch(
      new StreamDiagramActions.SelectCreateStage(this.insertTile.parentId)
    );
  }
  selectStage(taskTile: TaskTile) {
    this.store.dispatch(new StreamDiagramActions.SelectStage(taskTile.task.id));
  }
}
