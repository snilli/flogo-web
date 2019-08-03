import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TreeModule } from 'primeng/components/tree/tree';

import { MonacoEditorModule } from '@flogo-web/editor';
import { MappingParser } from './services/map.parser';
import { FunctionsComponent } from './functions-list/functions.component';

import { EditorComponent } from './editor/editor.component';
import { MapperComponent } from './mapper.component';
import { InputListComponent } from './input-list/input-list.component';
import { OutputListComponent } from './output-list/output-list.component';
import { FunctionDetailsComponent } from './functions-list/function-details.component';
import { TreeComponent } from './tree/tree.component';
import { ListComponent } from './list/list.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';

import { TreeNodeFactoryService } from './services/tree-node-factory.service';
import { TreeService } from './services/tree.service';
import { IconsComponent } from './shared/icons.component';
import { InlineHrefDirective } from './shared/inline-href.directive';
import { IconsService } from './services/icons.service';
import { ClickOutsideDirective } from './shared/click-outside.directive';
import { ExpressionProcessorService } from './services/expression-processor.service';
import { MapperControllerFactory } from './services/mapper-controller';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([]),
    PerfectScrollbarModule,
    TreeModule,
    MonacoEditorModule,
  ],
  exports: [FunctionsComponent, MapperComponent],
  declarations: [
    EditorComponent,
    FunctionsComponent,
    MapperComponent,
    InputListComponent,
    OutputListComponent,
    FunctionDetailsComponent,
    IconsComponent,
    BreadcrumbsComponent,
    InlineHrefDirective,
    ClickOutsideDirective,
    TreeComponent,
    ListComponent,
  ],
  entryComponents: [MapperComponent],
  providers: [
    TreeNodeFactoryService,
    TreeService,
    IconsService,
    ExpressionProcessorService,
    MappingParser,
    MapperControllerFactory,
  ],
  bootstrap: [],
})
export class MapperModule {}
