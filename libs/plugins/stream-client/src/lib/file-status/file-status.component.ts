import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FileStatus } from './file-status';

@Component({
  selector: 'flogo-stream-file-status',
  templateUrl: './file-status.component.html',
  styleUrls: ['./file-status.component.less'],
})
export class FileStatusComponent implements OnInit {
  @Input() status: FileStatus;
  @Output() remove: EventEmitter<void> = new EventEmitter();
  constructor() {}

  ngOnInit() {}
  removeFile() {
    if (this.status === FileStatus.Uploaded) {
      this.status = FileStatus.Empty;
      this.remove.emit();
    }
  }
}
