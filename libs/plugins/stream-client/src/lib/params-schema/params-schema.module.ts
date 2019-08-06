import { NgModule } from '@angular/core';
import { SharedModule } from '@flogo-web/lib-client/common';

import { ParamsSchemaComponent } from './params-schema.component';
import { ButtonComponent } from './button/button.component';
import { ParamRowInputComponent } from './param-row-input/param-row-input.component';
import { ParamRowOutputComponent } from './param-row-output/param-row-output.component';
import { GroupByParamService } from './param-row-input/group-by-param.service';

@NgModule({
  imports: [SharedModule],
  declarations: [
    ParamsSchemaComponent,
    ButtonComponent,

    // private to this module
    ParamRowInputComponent,
    ParamRowOutputComponent,
  ],
  providers: [GroupByParamService],
  exports: [ParamsSchemaComponent, ButtonComponent],
})
export class ParamsSchemaModule {}
