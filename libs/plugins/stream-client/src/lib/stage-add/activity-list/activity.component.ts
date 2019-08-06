import {
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener,
  HostBinding,
} from '@angular/core';
import { Highlightable } from '@angular/cdk/a11y';

@Component({
  selector: 'flogo-stream-stage-add-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.less'],
})
export class ActivityComponent implements Highlightable {
  @Input() activity;
  @Output() selected = new EventEmitter();
  @HostBinding('class.is-active') isHighlighted = false;
  disabled = false;

  @HostListener('click')
  select() {
    this.selected.emit(this.activity);
  }

  setActiveStyles() {
    this.isHighlighted = true;
  }

  setInactiveStyles() {
    this.isHighlighted = false;
  }
}
