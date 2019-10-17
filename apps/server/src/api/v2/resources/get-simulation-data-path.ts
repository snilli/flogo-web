import * as path from 'path';
import { config } from '../../../config';
import { getFileNames } from './get-file-names-in-dir';

export async function getSimulateDataPath(ctx) {
  let filePath;
  const uploadsDir = config.uploadsPath;
  const resourceId = ctx.params && ctx.params.resourceId;
  await getFileNames(uploadsDir).then(files => {
    const fileName = files.find(file => file.substr(0, file.indexOf('-')) === resourceId);
    if (fileName) {
      filePath = path.join(uploadsDir, fileName);
    }
    ctx.response.status = 200;
    ctx.body = {
      data: {
        filePath,
        fileName,
      },
    };
  });
}
