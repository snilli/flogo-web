import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SimulatorService } from '../../simulator';
import { SingleEmissionSubject } from '@flogo-web/lib-client/core';

@Component({
  selector: 'flogo-stream-run-stream-button',
  templateUrl: 'run-stream-button.component.html',
  styleUrls: [],
})
export class RunStreamButtonComponent implements OnInit, OnDestroy {
  @Input() resourceName: string;
  @Input() resourceId: string;

  private ngOnDestroy$ = SingleEmissionSubject.create();
  simulatorStatus$: Observable<string>;

  showFileInput = false;
  isSimulatorRunning = false;
  isSimulatorPaused = false;
  filePath: string;

  constructor(private simulatorService: SimulatorService) {}

  ngOnInit(): void {
    this.simulatorService.status$
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe(s => console.log(`simulator-status::${s}`));

    this.simulatorService.data$.pipe(takeUntil(this.ngOnDestroy$)).subscribe(data => {
      console.log(`simulator-data`);
      console.log(data);
    });

    this.simulatorStatus$ = this.simulatorService.status$;
  }

  runStream() {
    this.showFileInput = !this.showFileInput;
  }

  setFilePath(filePath) {
    this.filePath = filePath;
  }

  startSimulation() {
    this.simulatorService.start(this.resourceId, this.filePath);
    this.isSimulatorRunning = true;
    this.showFileInput = false;
  }

  stopSimulation() {
    this.simulatorService.stop();
    this.isSimulatorRunning = true;
  }

  pauseSimulation() {
    this.simulatorService.pause();
    this.isSimulatorPaused = true;
  }

  resumeSimulation() {
    this.simulatorService.resume();
    this.isSimulatorPaused = false;
  }

  ngOnDestroy() {
    this.ngOnDestroy$.emitAndComplete();
  }
}
