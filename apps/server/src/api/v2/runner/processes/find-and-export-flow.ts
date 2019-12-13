import { Context } from 'koa';
import { rootContainer } from "../../../../init";
import { FlowExporter } from "../../../../modules/transfer/export/flow-exporter";

export const findAndExportFlow = async (context: Context, next) => {
  const flowExporter =  rootContainer.get(FlowExporter);
  const { data } = await flowExporter.export(context.request.body.actionId);
  context.state.flow = transformToProcess(data);
  return next();
};

function transformToProcess(data) {
  const { name, description, metadata } = data;
  return {
    ...data,
    name: name,
    description: description || '',
    metadata: metadata || { input: [], output: [] },
  };
}
