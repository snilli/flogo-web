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
  try {
    await delPrevFilesIfAny(fileName);
    ctx.response.status = 200;
    ctx.body = {
      data: {
        filePath,
        fileName,
      },
    };
  } catch (error) {
    ctx.response.status = 500;
  }
}

async function delPrevFilesIfAny(currentFileName) {
  const uploadsDir = config.uploadsPath;
  const files = await getFileNames(uploadsDir);
  const resourceId = currentFileName.split('-')[0];
  const filesToDel = files.filter(
    file => file.substr(0, file.indexOf('-')) === resourceId && file !== currentFileName
  );
  const deleteFile = promisify(fs.unlink);
  return Promise.all(
    filesToDel.map(fileToDel => {
      const filePathToDel = path.join(uploadsDir, fileToDel);
      return deleteFile(filePathToDel);
    })
  );
}
