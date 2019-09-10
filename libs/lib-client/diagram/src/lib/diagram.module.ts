import { NgModule } from '@angular/core';
import { LanguageModule } from '@flogo-web/lib-client/language';
import { CommonModule } from '@angular/common';

import { DiagramComponent } from './diagram/diagram.component';
import { DiagramRowComponent } from './diagram/diagram-row.component';
import { TileInsertComponent } from './tiles/tile-insert.component';
import { TileTaskComponent } from './tiles/tile-task.component';

import { TileBranchComponent } from './tiles/tile-branch.component';
import { TileSsvgComponent } from './tiles/tiles-svg';

@NgModule({
  imports: [CommonModule, LanguageModule],

  exports: [DiagramComponent, TileInsertComponent, TileTaskComponent, TileSsvgComponent],
  declarations: [
    DiagramComponent,
    DiagramRowComponent,
    TileInsertComponent,
    TileBranchComponent,
    TileTaskComponent,
    TileSsvgComponent,
  ],
  providers: [],
})
export class DiagramModule {}
