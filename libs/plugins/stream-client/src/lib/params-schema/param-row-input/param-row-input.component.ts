import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SingleEmissionSubject } from '@flogo-web/lib-client/core';

@Component({
  selector: 'flogo-stream-params-schema-input-param-row',
  templateUrl: 'param-row-input.component.html',
  styleUrls: ['param-row-input.component.less'],
})

/**
 * @private
 */
export class ParamRowInputComponent implements OnDestroy, OnChanges {
  @Input() paramGroup: FormGroup;
  @Input() dropdownOptions;
  @Input() inputIndex;
  @Input() groupBy;
  @Output() removeParam: EventEmitter<number> = new EventEmitter<number>();
  @Output() updateGroupBy: EventEmitter<string> = new EventEmitter<string>();
  showGroupByBtn = true;
  selectedAsGroupBy = false;

  private ngOnDestroy$ = SingleEmissionSubject.create();

  constructor() {}

  ngOnChanges({ groupBy: groupByChange }: SimpleChanges): void {
    if (groupByChange) {
      this.setGroupBySelected();
    }
  }

  setGroupBySelected() {
    if (this.groupBy) {
      const inputParam =
        this.paramGroup &&
        this.paramGroup.get('name') &&
        this.paramGroup.get('name').value;
      if (inputParam === this.groupBy) {
        this.showGroupByBtn = true;
        this.selectedAsGroupBy = true;
      } else {
        this.showGroupByBtn = false;
        this.selectedAsGroupBy = false;
      }
    } else {
      this.showGroupByBtn = true;
      this.selectedAsGroupBy = false;
    }
  }

  onRemoveParam() {
    this.removeParam.emit(this.inputIndex);
  }

  selectType(type) {
    this.paramGroup.patchValue({ type });
  }

  updateGroupByParam() {
    if (this.selectedAsGroupBy) {
      this.selectGroupBy();
    }
  }

  selectGroupBy() {
    if (this.paramGroup.get('name').value && this.paramGroup.get('name').valid) {
      const param = this.paramGroup.get('name');
      this.updateGroupBy.emit(param.value);
    }
  }

  ngOnDestroy() {
    this.ngOnDestroy$.emitAndComplete();
  }
}
