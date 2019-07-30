import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlogoStreamTriggersPanelComponent } from './triggers.component';

import { CoreModule as FlogoCoreModule } from '@flogo-web/lib-client/core';
import { SharedModule as FlogoSharedModule } from '@flogo-web/lib-client/common';
import { ConfiguratorModule as TriggersConfiguratorModule } from './configurator';

import { ContribInstallerModule } from '@flogo-web/lib-client/contrib-installer';
import { FlogoSelectTriggerComponent } from './select-trigger/select-trigger.component';
import { TriggerBlockComponent } from './trigger-block';

@NgModule({
  imports: [
    CommonModule,
    FlogoSharedModule,
    FlogoCoreModule,
    ContribInstallerModule,
    TriggersConfiguratorModule,
  ],
  declarations: [
    TriggerBlockComponent,
    FlogoStreamTriggersPanelComponent,
    FlogoSelectTriggerComponent,
  ],
  exports: [FlogoStreamTriggersPanelComponent],
})
export class TriggersModule {}
