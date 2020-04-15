import { Injectable } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

import { Tile } from '@flogo-web/lib-client/diagram';

import { DropActionData } from './interface';

@Injectable()
export class DragTileService {
  prepareDropActionData(
    dropEvent: CdkDragDrop<Tile[]>,
    getBranchId?: () => string
  ): DropActionData {
    const { previousIndex, currentIndex, item, container, previousContainer } = dropEvent;

    if (previousContainer === container && previousIndex === currentIndex) {
      /* Returning if the item is dropped in it's original place */
      return;
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
}
