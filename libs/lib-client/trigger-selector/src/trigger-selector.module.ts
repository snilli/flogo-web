import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from '@flogo-web/lib-client/modal';
import { TriggerSelectorComponent } from './trigger-selector.component';

@NgModule({
  declarations: [TriggerSelectorComponent],
  imports: [CommonModule, ModalModule],
  providers: [],
  exports: [TriggerSelectorComponent],
})
export class TriggerSelectorModule {}
