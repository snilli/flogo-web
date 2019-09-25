import { Component, HostBinding, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  animateChild,
  transition,
  trigger as animationTrigger,
} from '@angular/animations';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SingleEmissionSubject } from '@flogo-web/lib-client/core';
import { ContribInstallerService } from '@flogo-web/lib-client/contrib-installer';
import { StreamMetadata } from '@flogo-web/plugins/stream-core';

import {
  ChangeDescription,
  ChangeName,
  UpdateMetadata,
  ContributionInstalled,
  FlogoStreamState,
  StreamService,
  StreamSelectors,
  StreamActions,
  StreamStoreState as AppState,
} from '../core';
import { ParamsSchemaComponent } from '../params-schema';
import { ROOT_PIPELINE_ID } from '../simulator';

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
  @ViewChild('inputSchemaModal', { static: true })
  defineInputSchema: ParamsSchemaComponent;

  streamState: FlogoStreamState;
  isStreamMenuOpen = false;
  isSimulatorOpen$: Observable<boolean>;
  triggerPosition = {
    left: '182px',
  };
  simulationId: 0;
  currentSimulationStage$: Observable<string | number>;
  // todo: add type
  selectedStageInfo$: Observable<any>;

  private ngOnDestroy$ = SingleEmissionSubject.create();

  constructor(
    private store: Store<AppState>,
    private streamService: StreamService,
    private contribInstallerService: ContribInstallerService
  ) {}

  ngOnInit() {
    this.store
      .pipe(select(StreamSelectors.selectStreamState))
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(streamState => {
        this.streamState = streamState;
      });

    this.currentSimulationStage$ = this.store.pipe(
      select(StreamSelectors.getCurrentSimulationStage)
    );

    this.contribInstallerService.contribInstalled$
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(contribDetails =>
        this.store.dispatch(new ContributionInstalled(contribDetails))
      );
    this.isSimulatorOpen$ = this.store.pipe(
      select(StreamSelectors.selectSimulatorPanelOpen)
    );

    this.selectedStageInfo$ = this.store.pipe(
      select(StreamSelectors.getSelectedStageInfo)
    );
  }

  changePanelState(isSimulatorOpen: boolean) {
    this.store.dispatch(
      new StreamActions.SimulatorPanelStatusChange({ isSimulatorOpen })
    );
  }

  navigateToApp() {
    this.streamService.navigateToApp(this.streamState.app.id);
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

  openInputSchemaModal() {
    this.defineInputSchema.openInputSchemaModel();
  }

  onStreamSchemaSave(metadata: StreamMetadata) {
    this.store.dispatch(new UpdateMetadata(metadata));
  }

  deleteStream() {
    this.closeStreamMenu();
    this.streamService.deleteStream(this.streamState);
  }

  ngOnDestroy() {
    this.ngOnDestroy$.emitAndComplete();
  }
}
