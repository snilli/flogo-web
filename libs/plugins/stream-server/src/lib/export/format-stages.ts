import { StreamResourceModel, StreamData } from '@flogo-web/plugins/stream-core';
import { ExportRefAgent } from '@flogo-web/lib-server/core';
import { ContributionType } from '@flogo-web/core';

export function formatStages(
  streamData: Partial<StreamData>,
  refAgent: ExportRefAgent
): StreamResourceModel.Stage[] {
  const { stages } = streamData;
  /* streams-plugin-todo: Need to format the configuration of the stage and register the functions used in them */
  return (stages || []).map(stage => ({
    ...stage,
    ref: refAgent.getAliasRef(ContributionType.Activity, stage.ref),
  }));
}
