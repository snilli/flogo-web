import { Component } from '@angular/core';
import { StreamStoreState, FlogoStreamState } from '../core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'flogo-stream-designer',
  templateUrl: './stream-designer.component.html',
  styleUrls: ['./stream-designer.component.less'],
})
export class StreamDesignerComponent {
  streamState: Observable<FlogoStreamState>;

  constructor(private store: Store<StreamStoreState>) {}
}
