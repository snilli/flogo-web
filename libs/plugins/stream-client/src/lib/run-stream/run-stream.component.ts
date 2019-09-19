import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { RestApiService } from '@flogo-web/lib-client/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'flogo-stream-run-stream',
  templateUrl: 'run-stream.component.html',
  styleUrls: ['run-stream.component.less'],
})
export class RunStreamComponent implements OnChanges {
  @Input() resourceId: string;
  @Input() fileName: string;
  @Input() fileUploadStatus: string;
  @Output() setFilePath: EventEmitter<string> = new EventEmitter<string>();
  @Output() startSimulation: EventEmitter<any> = new EventEmitter();

  disableRunStream = true;

  constructor(private restApi: RestApiService, private http: HttpClient) {}

  ngOnChanges({ fileName }: SimpleChanges): void {
    if (fileName && fileName.currentValue) {
      this.setFileName(fileName.currentValue);
      this.disableRunStream = false;
    }
  }

  setFileName(fileName) {
    if (fileName.includes(this.resourceId)) {
      this.fileName = fileName.substring(this.resourceId.length + 1);
    }
  }

  uploadFile(files: FileList) {
    const fileToUpload = files.item(0);
    const formData = new FormData();
    formData.append(`${this.resourceId}-${fileToUpload.name}`, fileToUpload);
    const url = this.restApi.apiPrefix('upload/simulationData');
    const headers = new HttpHeaders({
      enctype: 'multipart/form-data',
    });
    this.fileUploadStatus = 'uploading';
    //todo: use post of restAPi service
    this.http.post(url, formData, { headers }).subscribe(
      (resp: any) => {
        this.setFilePath.emit(resp.data);
        this.fileUploadStatus = 'uploaded';
        this.disableRunStream = false;
      },
      () => {
        this.fileUploadStatus = 'errored';
        this.disableRunStream = true;
        this.fileName = 'Error.....try again';
      }
    );
  }

  runSimulation() {
    this.startSimulation.emit();
  }

  removeFile() {
    //todo: implement remove file
  }
}
