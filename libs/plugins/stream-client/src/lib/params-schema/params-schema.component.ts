import { isEmpty } from 'lodash';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

import { BsModalComponent } from 'ng2-bs3-modal';

import { ValueType } from '@flogo-web/core';
import { StreamMetadata } from '@flogo-web/plugins/stream-core';
import { ResourceInterfaceBuilderService } from '@flogo-web/lib-client/resource-interface-builder';
import { GroupByParamService } from './param-row-input/group-by-param.service';

@Component({
  selector: 'flogo-stream-params-schema',
  templateUrl: 'params-schema.component.html',
  styleUrls: ['params-schema.component.less'],
})
export class ParamsSchemaComponent implements OnInit {
  @ViewChild('modal', { static: true })
  modal: BsModalComponent;
  paramsForm: FormGroup;
  @Input() metadata: StreamMetadata;
  @Output() save = new EventEmitter<StreamMetadata>();
  selectTypes: ValueType[] = [];
  displayInputParams: boolean;

  constructor(
    private resourceInterfaceBuilderService: ResourceInterfaceBuilderService,
    private groupByParamService: GroupByParamService
  ) {
    this.selectTypes = Array.from(ValueType.allTypes);
  }

  ngOnInit() {
    this.paramsForm = this.resourceInterfaceBuilderService.createForm();
  }

  showOutputParams() {
    this.displayInputParams = false;
  }

  showInputParams() {
    this.displayInputParams = true;
  }

  openInputSchemaModel() {
    this.displayInputParams = true;
    const metadata = isEmpty(this.metadata)
      ? {
          input: [],
          output: [],
        }
      : this.metadata;
    this.paramsForm = this.resourceInterfaceBuilderService.createForm(
      metadata.input,
      metadata.output
    );
    this.modal.open();
  }

  closeInputSchemaModel() {
    this.displayInputParams = false;
    this.modal.close();
  }

  addParams(fromParams: string) {
    const control = <FormArray>this.paramsForm.controls[fromParams];
    const paramControl = this.resourceInterfaceBuilderService.createParamFormRow();
    control.push(paramControl);
  }

  saveParams() {
    const mapParamsToStream = params =>
      params
        // filter out empty attributes
        .filter(param => param.name && param.name.trim().length > 0)
        .map(param => ({
          name: param.name.trim(),
          type: param.type || ValueType.String,
        }));

    const updatedParams = this.paramsForm.value;
    const input = mapParamsToStream(updatedParams.input);
    const output = mapParamsToStream(updatedParams.output);
    const groupBy = this.groupByParamService.selectedGroupBy;
    const metadata = this.normalizeMetadata(input, output, groupBy);
    this.save.next(metadata);
    this.closeInputSchemaModel();
  }

  normalizeMetadata(input, output, groupBy) {
    if (isEmpty(input) && isEmpty(output)) {
      return null;
    }
    return { input, output, groupBy };
  }

  removeParam(index: number, fromParams: string) {
    const control = <FormArray>this.paramsForm.controls[fromParams];
    const removeParam =
      control.controls[index].value && control.controls[index].value.name;
    if (
      fromParams === 'input' &&
      removeParam === this.groupByParamService.selectedGroupBy
    ) {
      this.groupByParamService.updateGroupBy('');
    }
    control.removeAt(index);
  }
}
