import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Observable } from 'rxjs';
import { StreamSimulation } from '@flogo-web/core';
import { RestApiService, SingleEmissionSubject } from '@flogo-web/lib-client/core';
import { SimulatorService } from '../../simulator';

@Component({
  selector: 'flogo-stream-run-stream-button',
  templateUrl: 'run-stream-button.component.html',
  styleUrls: [],
})
export class RunStreamButtonComponent implements OnInit, OnDestroy, OnChanges {
  @Input() resourceId: string;
  @Input() disableRunStream: boolean;
  @Output() openSimulationPanel: EventEmitter<void> = new EventEmitter<void>();

  private ngOnDestroy$ = SingleEmissionSubject.create();
  simulatorStatus$: Observable<StreamSimulation.ProcessStatus>;

  showFileInput = false;
  isSimulatorRunning = false;
  isSimulatorPaused = false;
  filePath: string;
  fileName: string;
  fileUploadStatus = 'empty';

  constructor(
    private simulatorService: SimulatorService,
    private restApi: RestApiService
  ) {}

  ngOnInit(): void {
    this.simulatorStatus$ = this.simulatorService.status$;
  }

  ngOnChanges({ disableRunStream }: SimpleChanges): void {
    if (!disableRunStream.firstChange && disableRunStream.currentValue) {
      this.showFileInput = false;
    }
  }

  runStream() {
    if (!this.filePath && !this.showFileInput) {
      this.setFileUploadStatus();
    }
    this.showFileInput = !this.showFileInput;
  }

  setFileUploadStatus() {
    this.restApi
      .get(`resources/simulateDataPath/${this.resourceId}`)
      .subscribe((resp: any) => {
        const { filePath, fileName } = resp;
        if (filePath) {
          this.filePath = filePath;
          this.fileName = fileName;
          this.fileUploadStatus = 'uploaded';
        }
      });
  }

  setFilePath(fileDetails) {
    this.filePath = fileDetails.filePath;
    this.fileName = fileDetails.fileName;
  }

  startSimulation() {
    this.simulatorService.start(this.resourceId, this.filePath);
    this.isSimulatorRunning = true;
    this.showFileInput = false;
    this.openSimulationPanel.emit();
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
