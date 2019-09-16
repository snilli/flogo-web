import { Component, HostBinding, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  animateChild,
  transition,
  trigger as animationTrigger,
} from '@angular/animations';
import { select, Store } from '@ngrx/store';
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
  selectStreamState,
  StreamService,
  StreamSelectors,
  StreamDiagramActions as StreamActions,
} from '../core';
import { StreamStoreState as AppState } from '../core';
import { ParamsSchemaComponent } from '../params-schema';
import { Observable } from 'rxjs';
import { SimulatorService } from '../simulator';

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
  simulatorStatus$: Observable<string>;

  private ngOnDestroy$ = SingleEmissionSubject.create();

  constructor(
    private store: Store<AppState>,
    private streamService: StreamService,
    private contribInstallerService: ContribInstallerService,
    private simulatorService: SimulatorService
  ) {}

  ngOnInit() {
    this.store
      .pipe(select(selectStreamState))
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(streamState => {
        this.streamState = streamState;
      });

    this.contribInstallerService.contribInstalled$
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(contribDetails =>
        this.store.dispatch(new ContributionInstalled(contribDetails))
      );
    this.isSimulatorOpen$ = this.store.pipe(
      select(StreamSelectors.selectSimulatorPanelOpen)
    );

    this.simulatorService.status$
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(s => console.log(`simulator-status::${s}`));

    this.simulatorService.data$.pipe(takeUntil(this.ngOnDestroy$)).subscribe(data => {
      console.log(`simulator-data`);
      console.log(data);
    });

    this.simulatorStatus$ = this.simulatorService.status$;
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

  startSimulation() {
    // todo: send file name
    this.simulatorService.start(
      this.streamState.id,
      '/Users/fcastill/flogoengine/streams-engine/single-number.csv'
    );
  }

  stopSimulation() {
    this.simulatorService.stop();
  }

  public openInputSchemaModal() {
    this.defineInputSchema.openInputSchemaModel();
  }

  public onStreamSchemaSave(metadata: StreamMetadata) {
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
