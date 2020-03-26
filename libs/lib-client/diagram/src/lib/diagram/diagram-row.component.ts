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

import { NodeType } from '@flogo-web/lib-client/core';

import { Tile, TaskTile, TileType, DiagramAction, DiagramSelection } from '../interfaces';
import { actionEventFactory } from '../action-event-factory';
import { RowIndexService } from '../shared';
import { rowAnimations } from './diagram-row.animations';
import { trackTileByFn } from '../tiles/track-tile-by';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

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
  // Needed to maintain the index of the branch tile for updating the tile on dropped in this row
  branchTileIndex;

  constructor(private rowIndexService: RowIndexService) {}

  ngOnChanges({ row: rowChange }: SimpleChanges) {
    if (rowChange) {
      this.tiles = this.row;
    }
    this.branchTileIndex = this.tiles.findIndex(
      (tile: TaskTile) => tile.task?.type === NodeType.Branch
    );
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

  updateTile(event: CdkDragDrop<Tile[]>) {
    const newIndex = this.branchTileIndex + event.currentIndex + 1;
    const prevIndex = event.item.data.index;
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, prevIndex, newIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        prevIndex,
        newIndex
      );
    }
  }
}
