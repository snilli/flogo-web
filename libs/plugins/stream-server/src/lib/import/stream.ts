import { Resource, ContributionType } from '@flogo-web/core';
import {
  StreamData,
  StreamMetadata,
  InternalStage,
  StreamActionSettings,
  StreamResourceModel,
} from '@flogo-web/plugins/stream-core';
import { ResourceImportContext, ValidationError } from '@flogo-web/lib-server/core';

import { STREAM_POINTER } from '../constants';
import { makeResourceValidator } from './make-resource-validator';

export function importStreamResource(
  resource: Resource<StreamData>,
  context: ResourceImportContext
): Resource<StreamData> {
  const validate = makeResourceValidator(
    Array.from(context.contributions.keys()),
    context.importsRefAgent
  );
  const errors = validate(resource);
  if (errors) {
    throw new ValidationError('Stream data validation errors', errors);
  }
  return {
    ...resource,
    metadata: extractMetadata(resource, context),
    data: {
      stages: extractStages(resource, context),
    },
  };
}

function extractMetadata(
  resource: Resource,
  { actionsManager, normalizedResourceIds }: ResourceImportContext
): StreamMetadata {
  const metadata = { ...resource.metadata };
  const originalResourceId = getOriginalId(normalizedResourceIds, resource.id);
  const actionSettings = actionsManager.getSettingsForResourceId(
    originalResourceId,
    STREAM_POINTER
  ) as StreamActionSettings;
  return {
    input: metadata.input || [],
    output: metadata.output || [],
    groupBy: actionSettings && actionSettings.groupBy,
  };
}

function extractStages(
  resource: Resource<StreamData>,
  context: ResourceImportContext
): InternalStage[] {
  const getStageReference = (alias: string) => {
    return context.importsRefAgent.getPackageRef(ContributionType.Activity, alias);
  };
  const rawStages = (resource.data && resource.data.stages) || [];
  return rawStages.map((stage, index) => {
    stage.ref = getStageReference(stage.ref);
    return formatStage(stage, index);
  });
}

function getOriginalId(source: Map<string, string>, newId: string): string {
  return Array.from(source.entries()).find(([, resourceId]) => resourceId === newId)[0];
}

function formatStage(stage: StreamResourceModel.Stage, idx: number): InternalStage {
  const { ref, name, description, output } = stage;
  // ref may have the full path of the contribution and we just need the name of the contribution.
  const contribName = ref.split('/').pop();
  return {
    id: `${contribName}_${idx + 2}`,
    ref,
    name,
    description,
    activitySettings: stage.settings,
    inputMappings: stage.input,
    output,
  };
}
