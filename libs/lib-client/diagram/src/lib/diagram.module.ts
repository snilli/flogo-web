import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { LanguageModule } from '@flogo-web/lib-client/language';

import { DiagramComponent } from './diagram/diagram.component';
import { DiagramRowComponent } from './diagram/diagram-row.component';
import { TileInsertComponent } from './tiles/tile-insert.component';
import { TileTaskComponent } from './tiles/tile-task.component';

import { TileBranchComponent } from './tiles/tile-branch.component';
import { TileSsvgComponent } from './tiles/tiles-svg';
import { DragTileService } from './drag-tiles';

@NgModule({
  imports: [CommonModule, LanguageModule, DragDropModule],

  exports: [DiagramComponent, TileInsertComponent, TileTaskComponent, TileSsvgComponent],
  declarations: [
    DiagramComponent,
    DiagramRowComponent,
    TileInsertComponent,
    TileBranchComponent,
    TileTaskComponent,
    TileSsvgComponent,
  ],
  providers: [DragTileService],
})
export class DiagramModule {}
