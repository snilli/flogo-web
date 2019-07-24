import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HeaderModule as FlogoDesignerHeader } from '@flogo-web/lib-client/designer-header';
import { LogsModule as FlogoLogsModule } from '@flogo-web/lib-client/logs';
import { SharedModule as FlogoSharedModule } from '@flogo-web/lib-client/common';
import {
  StreamService,
  StreamSaveEffects,
  featureReducer,
  FlogoProfileService,
} from './core';
import { StreamDesignerComponent } from './stream-designer';
import { StreamDataResolver } from './stream-data.resolver';
import { TriggersModule as FlogoStreamTriggersModule } from './triggers/triggers.module';

@NgModule({
  imports: [
    CommonModule,
    FlogoSharedModule,
    FlogoDesignerHeader,
    FlogoLogsModule,
    FlogoSharedModule,
    FlogoStreamTriggersModule,
    StoreModule.forFeature('stream', featureReducer),
    EffectsModule.forFeature([StreamSaveEffects]),
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: StreamDesignerComponent,
        resolve: { streamData: StreamDataResolver },
      },
    ]),
  ],
  providers: [StreamService, StreamDataResolver, FlogoProfileService],
  declarations: [StreamDesignerComponent],
})
export class StreamClientModule {}
