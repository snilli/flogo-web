import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { StreamProcessStatus } from '@flogo-web/core';
import { SingleEmissionSubject } from '@flogo-web/lib-client/core';
import { SimulatorService } from '../../simulator';

@Component({
  selector: 'flogo-stream-run-stream-button',
  templateUrl: 'run-stream-button.component.html',
  styleUrls: [],
})
export class RunStreamButtonComponent implements OnInit, OnDestroy {
  @Input() resourceName: string;
  @Input() resourceId: string;

  private ngOnDestroy$ = SingleEmissionSubject.create();
  simulatorStatus$: Observable<StreamProcessStatus>;

  showFileInput = false;
  isSimulatorRunning = false;
  isSimulatorPaused = false;
  filePath: string;

  constructor(private simulatorService: SimulatorService) {}

  ngOnInit(): void {
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
