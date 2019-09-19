import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { StreamProcessStatus } from '@flogo-web/core';
import { RestApiService, SingleEmissionSubject } from '@flogo-web/lib-client/core';
import { SimulatorService } from '../../simulator';

@Component({
  selector: 'flogo-stream-run-stream-button',
  templateUrl: 'run-stream-button.component.html',
  styleUrls: [],
})
export class RunStreamButtonComponent implements OnInit, OnDestroy {
  @Input() resourceId: string;

  private ngOnDestroy$ = SingleEmissionSubject.create();
  simulatorStatus: StreamProcessStatus;

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
    this.simulatorService.status$.subscribe(status => {
      this.simulatorStatus = status;
    });
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
  }

  stopSimulation() {
    this.simulatorService.stop();
    this.isSimulatorRunning = true;
  }

  pauseSimulation() {
    this.simulatorStatus = StreamProcessStatus.Paused;
    this.simulatorService.pause();
    this.isSimulatorPaused = true;
  }

  resumeSimulation() {
    this.simulatorStatus = StreamProcessStatus.Running;
    this.simulatorService.resume();
    this.isSimulatorPaused = false;
  }

  ngOnDestroy() {
    this.ngOnDestroy$.emitAndComplete();
  }
}
