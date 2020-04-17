import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

import { NodeType } from '@flogo-web/lib-client/core';

import { DiagramAction, DiagramSelection, TaskTile, Tile, TileType } from '../interfaces';
import { actionEventFactory } from '../action-event-factory';
import { RowIndexService } from '../shared';
import { rowAnimations } from './diagram-row.animations';
import { trackTileByFn } from '../tiles/track-tile-by';
import { DragTileService } from '../drag-tiles';

@Component({
  selector: 'flogo-diagram-row',
  templateUrl: './diagram-row.component.html',
  styleUrls: ['./diagram-row.component.less'],
  animations: rowAnimations,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagramRowComponent implements OnChanges {
  @Input() row: Tile[];
  @Input() selection: DiagramSelection;
  @Input() rowIndex: number;
  @HostBinding('class.is-readonly') @Input() isReadOnly = false;
  @Output() action = new EventEmitter<DiagramAction>();

  tileTypes = TileType;
  nodeTypes = NodeType;
  tiles: Tile[];
  trackTileBy = trackTileByFn;

  constructor(
    private rowIndexService: RowIndexService,
    private dragService: DragTileService
  ) {}

  ngOnChanges({ row: rowChange }: SimpleChanges) {
    if (rowChange) {
      this.tiles = this.row;
    }
  }

  calculateBranchSpan(taskTile: TaskTile) {
    const [parentId] = taskTile.task.parents;
    const parentRowIndex = this.rowIndexService.getRowIndexForTask(parentId);
    return this.rowIndex - parentRowIndex;
  }

  onInsertSelected(parentId: string) {
    this.action.emit(actionEventFactory.insert(parentId));
  }

  onTaskSelected(taskTile: TaskTile) {
    this.action.emit(actionEventFactory.select(taskTile.task.id));
  }

  onTaskAction(action: DiagramAction) {
    this.action.emit(action);
  }

  moveTile(event: CdkDragDrop<Tile[]>) {
    if (this.isItemDroppedOnEmptyArea(event)) {
      return;
    }
    const dropActionData = this.dragService.prepareDropActionData(event, () => {
      const branchTile: TaskTile = this.tiles.find(
        (tile: TaskTile) => tile?.task?.type === NodeType.Branch
      ) as TaskTile;
      return branchTile?.task.id;
    });
    if (dropActionData) {
      const { itemId, parentId } = dropActionData;
      this.action.emit(actionEventFactory.move(itemId, parentId));
    }
  }

  isItemDroppedOnEmptyArea(dragDropEvent) {
    return !dragDropEvent.isPointerOverContainer;
  }
}
