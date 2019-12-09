import { Context } from 'koa';
import * as Router from 'koa-router';
import { Services } from '../services';
import { findAndExportFlow } from './find-and-export-flow';

export function createProcessesRouter(createRouter): Router {
  const processes = createRouter();

  processes.post('/processes', findAndExportFlow, async (ctx: Context) => {
    const response = await Services.flowsServer.client.post('/flows', {
      body: ctx.state.flow,
    });
    ctx.body = response.body;
  });

  processes.post('/processes/restart', async (ctx: Context) => {
    const response = await Services.engine.client.post('/flow/restart', {
      body: ctx.request.body,
    });
    ctx.body = response.body;
  });

  processes.get('/processes/:processId', async (ctx: Context) => {
    const response = await Services.flowsServer.client.get(
      `/flows/${ctx.params.processId}`
    );
    ctx.body = response.body;
  });

  processes.post('/processes/:processId/start', startProcess);

  return processes;
}

async function startProcess(ctx: Context) {
  // todo: if ! ctx.request.body
  const { flowsServer, engine } = Services;
  const flowURI = `${flowsServer.getUrl()}/flows/${ctx.params.processId}`;
  const result = await engine.client.post('/flow/start', {
    body: {
      id: ctx.params.processId,
      ...ctx.request.body,
      flowURI,
    },
  });
  ctx.body = result.body;
}
