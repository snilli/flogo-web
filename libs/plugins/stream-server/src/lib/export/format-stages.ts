import { StreamResourceModel, StreamData } from '@flogo-web/plugins/stream-core';
import { ExportRefAgent } from '@flogo-web/lib-server/core';
import { ContributionType, MapperUtils } from '@flogo-web/core';
import { pick, uniq } from 'lodash';

const extractFunctions = mappings =>
  MapperUtils.functions.parseAndExtractReferencesInMappings(mappings);
const MAPPING_PROPERTIES = ['inputMappings', 'output', 'activitySettings'];

export function formatStages(
  streamData: Partial<StreamData>,
  refAgent: ExportRefAgent
): StreamResourceModel.Stage[] {
  const { stages } = streamData;
  return (stages || []).map(stage => {
    /* Registering any functions used in the mappings */
    const allFunctionsUsed = MAPPING_PROPERTIES.reduce(
      (allFns, prop) => allFns.concat(extractFunctions(stage[prop] || {})),
      []
    );
    uniq(allFunctionsUsed).forEach(functionName =>
      refAgent.registerFunctionName(functionName)
    );
    return {
      ...pick(stage, ['name', 'description', 'output']),
      ref: refAgent.getAliasRef(ContributionType.Activity, stage.ref),
      input: stage.inputMappings,
      settings: stage.activitySettings,
    };
  });
}
