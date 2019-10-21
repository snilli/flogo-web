import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

import { config } from '../../../config';
import { getFileNames } from './get-file-names-in-dir';

export async function removeSimulateData(ctx) {
  const uploadsDir = config.uploadsPath;
  const resourceId = ctx.params && ctx.params.resourceId;
  await getFileNames(uploadsDir).then(async files => {
    const fileName = files.find(file => file.substr(0, file.indexOf('-')) === resourceId);
    const filePath = path.join(uploadsDir, fileName);
    await promisify(fs.unlink)(filePath).then(() => {
      ctx.status = 204;
    });
  });
}
