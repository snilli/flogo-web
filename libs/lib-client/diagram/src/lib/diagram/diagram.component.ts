import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TrackByFunction,
} from '@angular/core';

import { FlowGraph } from '@flogo-web/lib-client/core';

import { DiagramAction, DiagramSelection, Tile } from '../interfaces';
import { EMPTY_MATRIX, RowIndexService } from '../shared';
import { makeRenderableMatrix, TileMatrix } from '../renderable-model';
import { diagramAnimations } from './diagram.animations';
import { diagramRowTracker } from './diagram-row-tracker';
import { DragTileService } from '../drag-tiles';

@Component({
  // temporal name until old diagram implementation is removed
  selector: 'flogo-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.less'],
  providers: [RowIndexService],
  animations: diagramAnimations,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagramComponent implements OnChanges, OnDestroy {
  @HostBinding('@list') animateList = true;
  @Input() flow: FlowGraph;
  @Input() selection: DiagramSelection;
  @Input() diagramId?: string;
  @Input() @HostBinding('class.flogo-diagram-is-readonly') isReadOnly = false;
  @Output() action = new EventEmitter<DiagramAction>();
  tileMatrix: TileMatrix;
  rowParentsList: string[][] = [];

  trackRowBy: TrackByFunction<Tile[]>;

  constructor(
    private rowIndexService: RowIndexService,
    private dragService: DragTileService
  ) {
    this.trackRowBy = diagramRowTracker(this);
  }

  ngOnChanges({ flow: flowChange, isReadOnly: readOnlyChange }: SimpleChanges) {
    const readOnlyDidChange =
      readOnlyChange && readOnlyChange.currentValue !== readOnlyChange.previousValue;
    if (flowChange || readOnlyDidChange) {
      this.updateMatrix();
    }
  }

  ngOnDestroy() {
    this.rowIndexService.clear();
  }

  onAction(action: DiagramAction) {
    this.action.emit({ ...action, diagramId: this.diagramId });
  }

  private updateMatrix() {
    const tileMatrix = makeRenderableMatrix(this.flow, 10, this.isReadOnly);
    this.rowIndexService.updateRowIndexes(tileMatrix);
    if (tileMatrix.length > 1) {
      const rowParentsList = this.updateRowParentsList(tileMatrix);
      // matrix is reversed to make sure html stack order always goes from bottom to top
      // i.e. top rows are rendered in front of bottom rows, this ensures branches don't display on top of the tiles above
      this.tileMatrix = tileMatrix.reverse();
      this.rowParentsList = rowParentsList.reverse();
    } else if (tileMatrix.length === 0 && !this.isReadOnly) {
      this.tileMatrix = EMPTY_MATRIX;
    } else {
      this.tileMatrix = tileMatrix;
    }
  }

  private updateRowParentsList(tileMatrix) {
    const rowIndexes = this.rowIndexService.getRowIndexes();
    return this.dragService.getAllRowsParentTiles(tileMatrix, rowIndexes);
  }
}
