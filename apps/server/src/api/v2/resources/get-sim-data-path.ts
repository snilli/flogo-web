import * as path from 'path';
import * as fs from 'fs';

import { config } from '../../../config';

export function getSimulateDataPath(ctx) {
  //let filePath = null;
  const uploadsDir = config.uploadsPath;
  //todo: uncomment below
  /*const resourceId = ctx.params && ctx.params.resourceId;
  const fileName = fs.readdirSync(uploadsDir)
    .find((file) => file.substr(0, file.indexOf('-')) === resourceId);
  if(fileName) {
    filePath = path.join(uploadsDir, fileName);
  }*/
  //todo: remove below hardcoded file name
  const fileName = 'out.csv';
  const filePath = path.join(uploadsDir, fileName);
  ctx.response.status = 200;
  ctx.body = {
    data: {
      filePath,
      fileName,
    },
  };
}
