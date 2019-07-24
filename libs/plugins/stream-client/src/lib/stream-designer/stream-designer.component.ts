import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  animateChild,
  transition,
  trigger as animationTrigger,
} from '@angular/animations';
import { select, Store } from '@ngrx/store';
import {
  ChangeDescription,
  ChangeName,
  FlogoStreamState,
  selectStreamState,
} from '../core';
import { StreamStoreState as AppState } from '../core';
import { takeUntil } from 'rxjs/operators';
import { SingleEmissionSubject } from '@flogo-web/lib-client/core';
@Component({
  selector: 'flogo-stream-designer',
  templateUrl: './stream-designer.component.html',
  styleUrls: ['./stream-designer.component.less'],
  animations: [
    animationTrigger('initialAnimation', [transition('void => *', animateChild())]),
  ],
})
export class StreamDesignerComponent implements OnInit, OnDestroy {
  @HostBinding('@initialAnimation') initialAnimation = true;

  streamState: FlogoStreamState;
  isStreamMenuOpen = false;

  private ngOnDestroy$ = SingleEmissionSubject.create();

  constructor(private store: Store<AppState>, private router: Router) {}

  ngOnInit() {
    this.store
      .pipe(select(selectStreamState))
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(streamState => {
        this.streamState = streamState;
      });
  }

  navigateToApp() {
    this.router.navigate(['/apps', this.streamState.app.id]);
  }

  changeStreamDescription(description) {
    this.store.dispatch(new ChangeDescription(description));
  }

  changeStreamName(name) {
    this.store.dispatch(new ChangeName(name));
  }

  closeStreamMenu() {
    this.isStreamMenuOpen = false;
  }

  toggleStreamMenu() {
    this.isStreamMenuOpen = !this.isStreamMenuOpen;
  }

  deleteStream() {}

  ngOnDestroy() {
    this.ngOnDestroy$.emitAndComplete();
  }
}
