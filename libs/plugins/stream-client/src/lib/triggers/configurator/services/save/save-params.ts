import { FormGroup } from '@angular/forms';
import { MapperController } from '../../../../shared/mapper';

export interface SaveParams {
  settings: FormGroup;
  flowInputMapper: MapperController;
  replyMapper?: MapperController;
}
