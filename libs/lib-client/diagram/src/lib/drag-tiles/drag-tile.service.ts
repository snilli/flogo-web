import { groupBy, map, pickBy } from 'lodash';
import { Injectable } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

import { GraphNodeDictionary, NodeType } from '@flogo-web/lib-client/core';

import { TaskTile, Tile, TileType } from '../interfaces';
import { DropActionData, TilesGroupedByZone } from './interface';
import { BRANCH_PREFIX, MAX_ROW_LENGTH } from '../constants';

/* The following enum is based on the return value of MouseEvent.buttons as described in
    https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
 */
enum MouseButtonPressed {
  NO_BUTTON,
  PRIMARY_BUTTON,
}

export enum DragTilePosition {
  OUTSIDE,
  INSIDE,
}

interface TileDropAllowStatus {
  allow: boolean;
  occurrenceInMaxPaths: number;
}

@Injectable()
export class DragTileService {
  private rowAllParents: Map<number, string[]>;
  private isDragInsideContainer = false;
  private nodes: GraphNodeDictionary;
  private maxPaths: Array<string[]>;
  private tilesDropAllowStatus: Map<string, TileDropAllowStatus>;

  groupTilesByZone(allTiles: Tile[]): TilesGroupedByZone {
    const { preDropZone, dropZone, postDropZone } = groupBy(allTiles, (tile: Tile) => {
      switch (tile.type) {
        case TileType.Padding:
          return 'preDropZone';
        case TileType.Task: {
          const { task } = tile as TaskTile;
          if (task.type === NodeType.Branch) {
            return 'preDropZone';
          } else if (task?.features?.canHaveChildren) {
            return 'dropZone';
          }
          return 'postDropZone';
        }
        case TileType.Insert:
        case TileType.Placeholder:
          return 'postDropZone';
      }
    });
    return {
      preDropZone: preDropZone || [],
      dropZone: dropZone || [],
      postDropZone: postDropZone || [],
    };
  }

  prepareDropActionData(
    dropEvent: CdkDragDrop<Tile[]>,
    getBranchId?: () => string,
    getDropTileDetails?: (
      dropPosition: number
    ) => { dropTileId: string; dropPositionInRow: number }
  ): DropActionData {
    const { previousIndex, currentIndex, item, container, previousContainer } = dropEvent;

    if (!this.isDragInsideContainer) {
      return;
    }

    this.resetDraggingTracker();

    if (previousContainer === container && previousIndex === currentIndex) {
      /* Returning if the item is dropped in it's original place */
      return;
    }

    if (getDropTileDetails) {
      const dropTileDetails = getDropTileDetails(currentIndex);
      const isDropAllowed = dropTileDetails.dropTileId
        ? this.isDropAllowedOnDropTile(dropTileDetails, item.data)
        : this.isDropAllowedIfTileHasBranch(item.data, dropTileDetails.dropPositionInRow);
      if (!isDropAllowed) {
        return;
      }
    }

    const taskTilesInContainer = container.getSortedItems();
    let parentId: string = null;

    if (currentIndex > 0) {
      if (previousContainer === container && currentIndex > previousIndex) {
        parentId = taskTilesInContainer[currentIndex]?.data;
      } else {
        parentId = taskTilesInContainer[currentIndex - 1]?.data;
      }
    } else if (getBranchId) {
      /* When the tile is dropped at the first place of a non-zero indexed row then
         the parent of the tile will be the branch tile in this row and calculated
         by consumer */
      parentId = getBranchId();
    }
    return {
      itemId: item.data,
      parentId,
    };
  }

  updateRowParents(tileMatrix, getRowIndex: (tileId: string) => number) {
    this.rowAllParents = new Map<number, string[]>();
    const rowParentMap = new Map<number, string>();
    const totalRows = tileMatrix.length;
    tileMatrix.forEach((row, index) => {
      const rowIndex = totalRows - index - 1;
      const branchTask = row.find(tile => {
        return tile?.task?.type === NodeType.Branch;
      });
      if (branchTask) {
        rowParentMap.set(rowIndex, branchTask.task.parents[0]);
      }
    });
    rowParentMap.forEach((rowParent, rowIndex) => {
      this.rowAllParents.set(
        rowIndex,
        this.getRowAllParents(rowParent, rowParentMap, getRowIndex)
      );
    });
  }

  isTileAllowedToDropInRow(tileId, rowIndex) {
    const rowParents = this.rowAllParents.get(rowIndex);
    return !rowParents?.length || !rowParents.includes(tileId);
  }

  changeDraggingTracker(position: DragTilePosition, buttonsActive: MouseButtonPressed) {
    if (buttonsActive === MouseButtonPressed.PRIMARY_BUTTON) {
      switch (position) {
        case DragTilePosition.INSIDE:
          this.isDragInsideContainer = true;
          break;
        case DragTilePosition.OUTSIDE:
        default:
          this.resetDraggingTracker();
      }
    }
  }

  private getRowAllParents(parentTile, rowParents, getRowIndex) {
    const allParentTiles = [];
    while (parentTile) {
      allParentTiles.push(parentTile);
      const parentRowIndex = getRowIndex(parentTile);
      parentTile = rowParents.get(parentRowIndex);
    }
    return allParentTiles;
  }

  private resetDraggingTracker() {
    this.isDragInsideContainer = false;
  }

  initTilesDropAllowStatus(flow) {
    this.nodes = {};
    this.maxPaths = new Array<string[]>();
    this.tilesDropAllowStatus = new Map<string, TileDropAllowStatus>();
    const rootId = flow.rootId;
    if (rootId) {
      this.nodes = flow.nodes;
      const allPaths = this.getPathsFromTile(rootId);
      this.maxPaths = allPaths.filter(path => path.length === MAX_ROW_LENGTH);
      this.setTileDropAllowStatus();
    }
  }

  getPathsFromTile(fromTile, path = [], allPaths = []) {
    if (this.isNonBranchTask(fromTile)) {
      path.push(fromTile);
    }
    const children = this.nodes[fromTile].children;
    if (children.length) {
      for (const child of children) {
        this.getPathsFromTile(child, [...path], allPaths);
      }
    } else {
      allPaths.push(path);
    }
    return allPaths;
  }

  setTileDropAllowStatus() {
    const nonBranchTasks = pickBy(this.nodes, (node, nodeId) =>
      this.isNonBranchTask(nodeId)
    );
    const taskIds = map(nonBranchTasks, (node, nodeId) => nodeId);
    taskIds.forEach(taskId => {
      this.tilesDropAllowStatus.set(taskId, this.tileOccurrencesInMaxPaths(taskId));
    });
  }

  isNonBranchTask(taskId) {
    return !taskId.startsWith(BRANCH_PREFIX);
  }

  tileOccurrencesInMaxPaths(tileId): TileDropAllowStatus {
    let occurrence = 0;
    this.maxPaths.forEach(path => {
      if (path.includes(tileId)) {
        occurrence++;
      }
    });
    return { allow: !occurrence, occurrenceInMaxPaths: occurrence };
  }

  isDropAllowedOnDropTile(dropTileDetails, dragTile): boolean {
    return (
      this.tilesDropAllowStatus.get(dropTileDetails.dropTileId).allow &&
      this.isDropAllowedIfTileHasBranch(dragTile, dropTileDetails.dropPositionInRow)
    );
  }

  isDropAllowedIfTileHasBranch(dragTileId, dropPositionInRow) {
    const dragTileChildren = this.nodes[dragTileId].children;
    if (dragTileChildren.length > 1) {
      const branchPaths = this.getAllBranchPaths(dragTileId);
      const maxPathLength = branchPaths.reduce((maxLength, path) => {
        const pathLength = path.length;
        return pathLength > maxLength ? pathLength : maxLength;
      }, 0);
      const maxIndexInRow = MAX_ROW_LENGTH - 1;
      if (dropPositionInRow + maxPathLength > maxIndexInRow) {
        return false;
      }
    }
    return true;
  }

  getAllBranchPaths(fromTileId) {
    const branchTiles = this.getAllBranchTiles(fromTileId);
    let branchPaths = [];
    branchTiles.forEach(
      branchTile => (branchPaths = branchPaths.concat(this.getPathsFromTile(branchTile)))
    );
    return branchPaths;
  }

  getAllBranchTiles(tileId) {
    const tile = this.nodes[tileId];
    const tileChildren = tile.children;
    return tileChildren.filter(child => child.startsWith(BRANCH_PREFIX));
  }

  updateTilesDropAllowStatus(tileId: string) {
    if (!this.getTileDropAllowStatus(tileId).allow) {
      const tilePaths = this.getTilePaths(tileId);
      tilePaths.forEach(path => this.updateTilesInPathDropStatus(tileId, path));
    }
    return;
  }

  getTilePaths(tileId) {
    return this.maxPaths.filter(path => path.includes(tileId));
  }

  updateTilesInPathDropStatus(dragTileId, tilePath) {
    const dragTileOccurrence = this.getTileDropAllowStatus(dragTileId)
      .occurrenceInMaxPaths;
    tilePath.forEach(tileId => {
      const tileDropStatus = this.getTileDropAllowStatus(tileId);
      if (tileDropStatus.occurrenceInMaxPaths <= dragTileOccurrence) {
        this.updateTileDropStatusAllow(tileId);
      }
    });
  }

  updateTileDropStatusAllow(tileId: string) {
    const currentStatus = this.getTileDropAllowStatus(tileId);
    this.tilesDropAllowStatus.set(tileId, { ...currentStatus, allow: true });
  }

  getTileDropAllowStatus(tileId): TileDropAllowStatus {
    return this.tilesDropAllowStatus.get(tileId);
  }
}
