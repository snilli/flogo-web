import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { SharedModule } from '@flogo-web/lib-client/common';
import { FormBuilderModule as DynamicFormModule } from '../shared/dynamic-form';
import { FieldsComponent } from './fields/fields.component';
import { ErrorComponent } from './error/error.component';

import { DebugPanelComponent } from './debug-panel.component';
import { TogglerRefService } from './toggler-ref.service';

@NgModule({
  imports: [NgCommonModule, SharedModule, DynamicFormModule],
  declarations: [
    FieldsComponent,
    ErrorComponent,
    DebugPanelComponent,
  ],
  providers: [TogglerRefService],
  exports: [DebugPanelComponent],
})
export class DebugPanelModule {}
