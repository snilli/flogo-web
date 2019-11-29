import { Context } from 'koa';
import { ErrorManager } from '../../../../common/errors';

export const findAndExportFlow = async (context: Context, next) => {
  const action = await context.resourceService.findOne(context.request.body.actionId);
  if (!action) {
    return context.throw(
      ErrorManager.createRestNotFoundError('No flow with specified id')
    );
  }
  context.state.flow = await transformToProcess(action);
  return next();
};

// todo: fcastill - used for test-running flows, not supported in v0.9.0, re-enabling after
async function transformToProcess(action) {
  const { name, description, metadata, data } = action;
  // } = exporter.formatAction(action);
  return {
    name: name,
    description: description || '',
    metadata: metadata || { input: [], output: [] },
    ...data,
  };
}
