import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { config } from '../../config';
import { getFileNames } from './resources/get-file-names-in-dir';

export function fileUpload(router) {
  router.post('/upload/simulationData', handleFileUpload);
}

async function handleFileUpload(ctx) {
  const file = ctx.request.files;
  const fileName = Object.keys(file)[0];
  const filePath = file[fileName].path;
  await delPrevFilesIfAny(fileName);
  ctx.response.status = 200;
  ctx.body = {
    data: {
      filePath,
      fileName,
    },
  };
}

function delPrevFilesIfAny(currentFileName) {
  const uploadsDir = config.uploadsPath;
  return getFileNames(uploadsDir).then(files => {
    const resourceId = currentFileName.split('-')[0];
    const filesToDel = files.filter(
      file => file.substr(0, file.indexOf('-')) === resourceId && file !== currentFileName
    );
    filesToDel.map(async fileToDel => {
      const filePathToDel = path.join(uploadsDir, fileToDel);
      await promisify(fs.unlink)(filePathToDel);
    });
  });
}
