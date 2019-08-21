import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'flogo-stream-params-schema-output-param-row',
  templateUrl: 'param-row-output.component.html',
  styleUrls: ['param-row-output.component.less'],
})

/**
 * @private
 */
export class ParamRowOutputComponent {
  @Input() paramGroup: FormGroup;
  @Input() dropdownOptions;
  @Input() inputIndex;
  @Output() removeParam: EventEmitter<number> = new EventEmitter<number>();

  onRemoveParam() {
    this.removeParam.emit(this.inputIndex);
  }

  selectType(type) {
    this.paramGroup.patchValue({ type });
  }
}
