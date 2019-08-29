import { Resource, ContributionType } from '@flogo-web/core';
import {
  StreamData,
  StreamMetadata,
  InternalStage,
  StreamActionSettings,
} from '@flogo-web/plugins/stream-core';
import { ResourceImportContext } from '@flogo-web/lib-server/core';
import { STREAM_POINTER } from '../constants';

export function importStreamResource(
  resource: Resource<StreamData>,
  context: ResourceImportContext
): Resource<StreamData> {
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
  return rawStages.map(stage => {
    stage.ref = getStageReference(stage.ref);
    return stage;
  });
}

function getOriginalId(source: Map<string, string>, newId: string): string {
  return Array.from(source.entries()).find(([, resourceId]) => resourceId === newId)[0];
}
