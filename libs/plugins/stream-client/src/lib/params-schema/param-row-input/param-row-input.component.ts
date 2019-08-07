import { takeUntil } from 'rxjs/operators';
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SingleEmissionSubject } from '@flogo-web/lib-client/core';
import { GroupByParamService } from './group-by-param.service';

@Component({
  selector: 'flogo-stream-params-schema-input-param-row',
  templateUrl: 'param-row-input.component.html',
  styleUrls: ['param-row-input.component.less'],
})

/**
 * @private
 */
export class ParamRowInputComponent implements OnInit, OnDestroy {
  @Input() paramGroup: FormGroup;
  @Input() dropdownOptions;
  @Input() inputIndex;
  @Input() groupBy;
  @Output() removeParam: EventEmitter<number> = new EventEmitter<number>();
  showGroupByBtn = true;
  selectedAsGroupBy = false;

  private ngOnDestroy$ = SingleEmissionSubject.create();

  constructor(private groupByParamService: GroupByParamService) {}

  ngOnInit(): void {
    this.groupByParamService.updateGroupBy$
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(this.setGroupBySelected.bind(this));
    this.groupByParamService.updateGroupBy(this.groupBy);
  }

  setGroupBySelected() {
    const groupBy = this.groupByParamService.selectedGroupBy;
    if (groupBy) {
      const inputParam =
        this.paramGroup &&
        this.paramGroup.get('name') &&
        this.paramGroup.get('name').value;
      if (inputParam === groupBy) {
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

  updateGroupBy() {
    if (this.selectedAsGroupBy) {
      this.selectGroupBy();
    }
  }

  selectGroupBy() {
    if (this.paramGroup.get('name').value && this.paramGroup.get('name').valid) {
      const param = this.paramGroup.get('name');
      this.groupByParamService.updateGroupBy(param.value);
    }
  }

  ngOnDestroy() {
    this.ngOnDestroy$.emitAndComplete();
  }
}
