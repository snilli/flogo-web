import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { HeaderModule as FlogoDesignerHeader } from '@flogo-web/lib-client/designer-header';
import { LogsModule as FlogoLogsModule } from '@flogo-web/lib-client/logs';
import { SharedModule as FlogoSharedModule } from '@flogo-web/lib-client/common';
import { DiagramModule } from '@flogo-web/lib-client/diagram';
import { ResourceInterfaceBuilderModule } from '@flogo-web/lib-client/resource-interface-builder';
import { ContextPanelModule } from '@flogo-web/lib-client/context-panel';
import { MonacoEditorModule } from '@flogo-web/editor';

import {
  StreamService,
  StreamSaveEffects,
  TriggerMappingsEffects,
  featureReducer,
  FlogoProfileService,
  MicroServiceModelConverter,
} from './core';
import { StreamDesignerComponent } from './stream-designer';
import { StreamDataResolver } from './stream-data.resolver';
import { TriggersModule as FlogoStreamTriggersModule } from './triggers/triggers.module';
import { StreamDiagramComponent } from './stream-diagram';
import { ParamsSchemaModule } from './params-schema';
import { StageAddModule } from './stage-add';
import { StageConfiguratorModule } from './stage-configurator/stage-configurator.module';
import { SimulatorModule } from './simulator/simulator.module';
import { RunStreamModule } from './run-stream/run-stream.module';

@NgModule({
  imports: [
    CommonModule,
    FlogoSharedModule,
    FlogoDesignerHeader,
    FlogoLogsModule,
    FlogoStreamTriggersModule,
    DiagramModule,
    ParamsSchemaModule,
    ResourceInterfaceBuilderModule,
    StoreModule.forFeature('stream', featureReducer),
    EffectsModule.forFeature([StreamSaveEffects, TriggerMappingsEffects]),
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: StreamDesignerComponent,
        resolve: { streamData: StreamDataResolver },
      },
    ]),
    StageAddModule,
    MonacoEditorModule,
    StageConfiguratorModule,
    ContextPanelModule,
    SimulatorModule,
    RunStreamModule,
  ],
  providers: [
    StreamService,
    StreamDataResolver,
    FlogoProfileService,
    MicroServiceModelConverter,
  ],
  declarations: [StreamDesignerComponent, StreamDiagramComponent],
})
export class StreamClientModule {}
