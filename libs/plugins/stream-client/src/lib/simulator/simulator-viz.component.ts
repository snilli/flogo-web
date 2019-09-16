import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  OnDestroy,
  NgZone,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Observable, combineLatest, pipe, Subscription } from 'rxjs';
import { SingleEmissionSubject } from '@flogo-web/lib-client/core';
import { scan, filter, takeUntil, take } from 'rxjs/operators';
import { PerspectiveWorker } from '@finos/perspective';
import { PerspectiveService } from './perspective.service';
import PerspectiveViewer from '@finos/perspective-viewer';

const VIZ_LIMIT = 20;

@Component({
  selector: 'flogo-stream-simulator-viz',
  templateUrl: './simulator-viz.component.html',
  styleUrls: ['./simulator-viz.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatorVizComponent implements OnDestroy, AfterViewInit, OnChanges {
  @Input() values$: Observable<any[]>;
  @Input() schema: { [name: string]: string };
  @Input() view: string;
  @Input() simulationId: number;
  @Input() graphView = 'd3_y_line';
  @Input() graphFields?;
  @ViewChild('viewer', { static: true }) viewerElem: ElementRef;

  public currentView;
  public isStarting = true;
  private destroy$ = SingleEmissionSubject.create();
  private valueChangeSubscription: Subscription;

  constructor(
    private zone: NgZone,
    private cd: ChangeDetectorRef,
    private perspectiveService: PerspectiveService
  ) {}

  ngOnDestroy() {
    this.destroy$.emitAndComplete();
  }

  ngOnChanges({ schema: schemaChanges, view: viewChanges }: SimpleChanges) {
    if (this.isStarting) {
      return;
    }
    if (schemaChanges) {
      // const viewer = this.getViewer();
      // viewer.load(this.schema);
      // this.setColumns();
      // this.listenForUpdates();
      this.configure();
    }
    if (viewChanges && this.view) {
      this.getViewer().setAttribute('view', this.view);
    }
  }

  private configure() {
    this.isStarting = true;
    this.zone.runOutsideAngular(() => {
      combineLatest(
        this.perspectiveService.getWorker(),
        this.values$.pipe(valueAccumulator(this.simulationId))
      )
        .pipe(
          takeUntil(this.destroy$),
          take(1)
        )
        .subscribe(([worker, values]: [PerspectiveWorker, any[]]) => {
          const viewer = this.getViewer();
          const table = worker.table(this.schema, <any>{ limit: VIZ_LIMIT });
          table.update(values);
          viewer.load(<any>table, <any>{ limit: VIZ_LIMIT });
          (<any>this.getViewer()).reset();
          if (this.view) {
            viewer.setAttribute('view', this.view);
          }
          this.setColumns();
          this.listenForUpdates();

          this.isStarting = false;
          this.cd.detectChanges();
        });
    });
  }

  ngAfterViewInit() {
    const viewer = this.getViewer();
    viewer.addEventListener('perspective-config-update', () => {
      const currentView = viewer.getAttribute('view');
      if (currentView !== this.currentView) {
        this.currentView = viewer.getAttribute('view');
        this.cd.markForCheck();
      }
    });
    this.configure();
  }

  setView(viewName: string) {
    const viewer = this.getViewer();
    const currentViewName = viewer.getAttribute('view');
    if (currentViewName !== viewName) {
      viewer.setAttribute('view', viewName);
      if (viewName === 'hypergrid') {
        (<any>viewer).reset();
        this.setColumns();
      } else {
        this.setColumns(this.graphFields);
      }
    }
  }

  private setColumns(columns?) {
    const stringifiedColumns = JSON.stringify(columns || Object.keys(this.schema));
    this.getViewer().setAttribute('columns', stringifiedColumns);
  }

  private getViewer(): PerspectiveViewer {
    return this.viewerElem && this.viewerElem.nativeElement;
  }

  private listenForUpdates() {
    if (this.valueChangeSubscription) {
      this.valueChangeSubscription.unsubscribe();
    }
    this.valueChangeSubscription = this.values$
      .pipe(
        takeUntil(this.destroy$),
        valueAccumulator(this.simulationId)
      )
      .subscribe(values => {
        this.getViewer().update(values);
      });
  }
}

function accumulateValues(values, value) {
  values.unshift(value);
  return values.slice(0, VIZ_LIMIT);
}

function isNotEmpty(values) {
  return values && values.length > 0;
}

function valueAccumulator(simulationId) {
  return pipe(
    filter((v: any) => v && v.__simulationId === simulationId),
    scan(accumulateValues, []),
    filter(isNotEmpty)
  );
}
