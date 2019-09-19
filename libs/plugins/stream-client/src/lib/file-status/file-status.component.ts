import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'flogo-stream-file-status',
  templateUrl: './file-status.component.html',
  styleUrls: ['./file-status.component.less'],
})
export class FileStatusComponent implements OnInit {
  //todo: create enum for below statuses
  @Input() status: 'empty' | 'uploading' | 'uploaded' | 'errored' | 'dragging';
  @Output() remove: EventEmitter<void> = new EventEmitter();
  constructor() {}

  ngOnInit() {}
  removeFile() {
    if (this.status === 'uploaded') {
      this.status = 'empty';
      this.remove.emit();
    }
  }
}
