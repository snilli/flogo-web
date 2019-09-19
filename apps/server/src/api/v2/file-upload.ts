export function fileUpload(router) {
  router.post('/upload/simulationData', handleFileUpload);
}

function handleFileUpload(ctx) {
  const file = ctx.request.files;
  const fileName = Object.keys(file)[0];
  const filePath = file[fileName].path;
  ctx.response.status = 200;
  ctx.body = {
    data: {
      filePath,
      fileName,
    },
  };
}
