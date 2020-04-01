import { Injectable } from '@angular/core';
import { TileMatrix } from '../renderable-model';
import { Tile } from '../interfaces';
import { isTaskTile, isBranchTile } from './tile-guards';

@Injectable()
export class RowIndexService {
  private rowIndexes: Map<string, number>;
  // May be a good idea to maintain in the drag-drop service
  private branchIndex: Map<number, string>;

  updateRowIndexes(tileMatrix: TileMatrix) {
    const indexMap = new Map<string, number>();
    const branchRowMap = new Map<number, string>();
    const addTask = (tile: Tile, rowIndex: number) => {
      if (isTaskTile(tile)) {
        const task = tile.task;
        indexMap.set(task.id, rowIndex);

        if (isBranchTile(tile)) {
          branchRowMap.set(rowIndex, task.id);
        }
      }
    };
    const accumulateAllTasks = (row: Tile[], rowIndex: number) =>
      row.forEach(tile => addTask(tile, rowIndex));
    tileMatrix.forEach(accumulateAllTasks);
    this.rowIndexes = indexMap;
    this.branchIndex = branchRowMap;
  }

  getRowIndexForTask(taskId: string) {
    return this.rowIndexes.get(taskId);
  }

  getBranchIdInRow(rowIndex: number) {
    return this.branchIndex.get(rowIndex);
  }

  clear() {
    if (this.rowIndexes) {
      this.rowIndexes.clear();
    }
    if (this.branchIndex) {
      this.branchIndex.clear();
    }
  }
}
