import { FormGroup } from '@angular/forms';
import { MapperController } from '../../../../shared/mapper';

export interface SaveParams {
  settings: FormGroup;
  streamInputMapper: MapperController;
  replyMapper?: MapperController;
}
