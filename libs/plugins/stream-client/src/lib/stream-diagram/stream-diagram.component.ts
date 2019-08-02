import { Component, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';

import { DiagramGraph, SingleEmissionSubject } from '@flogo-web/lib-client/core';

import { StreamStoreState, selectGraph } from '../core/state';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'flogo-stream-diagram',
  templateUrl: './stream-diagram.component.html',
  styleUrls: ['./stream-diagram.component.less'],
})
export class StreamDiagramComponent implements OnDestroy {
  items$: Observable<DiagramGraph>;
  private ngOnDestroy$ = SingleEmissionSubject.create();

  constructor(private store: Store<StreamStoreState>) {
    this.items$ = this.store.pipe(
      select(selectGraph),
      takeUntil(this.ngOnDestroy$)
    );
  }

  ngOnDestroy(): void {
    this.ngOnDestroy$.emitAndComplete();
  }
}
