import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { StreamProcessStatus } from '@flogo-web/core';

@Component({
  selector: 'flogo-stream-run-action-status',
  templateUrl: './action-status.component.html',
  styleUrls: ['./action-status.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionStatusComponent {
  readonly statuses = StreamProcessStatus;
  @Input() status: StreamProcessStatus;
  @Input() disabled = false;
  @Input() disableRunStream: boolean;
  @Output() run = new EventEmitter<void>();
  @Output() pause = new EventEmitter<void>();
  @Output() resume = new EventEmitter<void>();
  @Output() stop = new EventEmitter<void>();
}
