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
import { takeUntil } from 'rxjs/operators';
import { isEmpty } from 'lodash';
import { StreamProcessStatus } from '@flogo-web/core';
import { SingleEmissionSubject } from '@flogo-web/lib-client/core';
import { SimulatorService } from '../../simulator';
import { FileStatus } from '../../file-status';
import { RunStreamService } from '../run-stream.service';

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
  simulatorStatus$: Observable<StreamProcessStatus>;

  showFileInput = false;
  isSimulatorRunning = false;
  isSimulatorPaused = false;
  filePath: string;
  fileName: string;
  fileUploadStatus = FileStatus.Empty;

  constructor(
    private simulatorService: SimulatorService,
    private runStreamService: RunStreamService
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
    this.runStreamService
      .getSimulationDataPath(this.resourceId)
      .pipe(takeUntil(this.ngOnDestroy$))
      .subscribe((resp: any) => {
        this.setFilePath(resp);
      });
  }

  setFilePath(fileDetails) {
    if (!isEmpty(fileDetails)) {
      this.filePath = fileDetails.filePath;
      this.fileName = fileDetails.fileName;
      this.fileUploadStatus = FileStatus.Uploaded;
    } else {
      this.filePath = '';
      this.fileName = '';
      this.fileUploadStatus = FileStatus.Empty;
    }
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
