import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RestApiService } from '@flogo-web/lib-client/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'flogo-stream-run-stream',
  templateUrl: 'run-stream.component.html',
  styleUrls: ['run-stream.component.less'],
})
export class RunStreamComponent {
  @Input() resourceName: string;
  @Output() setFilePath: EventEmitter<string> = new EventEmitter<string>();
  @Output() startSimulation: EventEmitter<any> = new EventEmitter();

  disableRunStream: boolean = true;
  fileUploadStatus: string = 'empty';

  constructor(private restApi: RestApiService, private http: HttpClient) {}

  uploadFile(files: FileList) {
    const fileToUpload = files.item(0);
    const formData = new FormData();
    formData.append(`${this.resourceName}-${fileToUpload.name}`, fileToUpload);
    const url = this.restApi.apiPrefix('upload/simulationData');
    const headers = new HttpHeaders({
      enctype: 'multipart/form-data',
    });
    this.fileUploadStatus = 'uploading';
    this.http.post(url, formData, { headers }).subscribe(
      (resp: any) => {
        const { filePath } = resp.data;
        this.setFilePath.emit(filePath);
        this.fileUploadStatus = 'uploaded';
        this.disableRunStream = false;
      },
      () => {
        this.fileUploadStatus = 'errored';
        this.disableRunStream = true;
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
