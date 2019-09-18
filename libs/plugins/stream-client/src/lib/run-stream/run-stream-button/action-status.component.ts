import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StreamProcessStatus } from '@flogo-web/core';

@Component({
  selector: 'flogo-stream-run-action-status',
  templateUrl: './action-status.component.html',
  styleUrls: ['./action-status.component.less'],
})
export class ActionStatusComponent implements OnInit {
  @Input() status: StreamProcessStatus;
  @Input() disabled = false;
  @Output() run = new EventEmitter();
  @Output() pause = new EventEmitter();
  @Output() resume = new EventEmitter();
  @Output() stop = new EventEmitter<void>();

  statuses = StreamProcessStatus;

  constructor() {}

  ngOnInit() {}
}
