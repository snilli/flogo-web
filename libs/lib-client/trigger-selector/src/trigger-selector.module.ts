import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from '@flogo-web/lib-client/modal';
import { TriggerSelectorComponent } from './trigger-selector.component';
import { SearchModule } from '@flogo-web/lib-client/search';

@NgModule({
  declarations: [TriggerSelectorComponent],
  imports: [CommonModule, ModalModule, SearchModule],

  providers: [],
  exports: [TriggerSelectorComponent],
})
export class TriggerSelectorModule {}
