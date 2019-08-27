import { ExportActionAgent } from '@flogo-web/lib-server/core';
import { StreamMetadata } from '@flogo-web/plugins/stream-core';
import { createResourceUri } from '@flogo-web/core';

export function registerAction(
  actionAgent: ExportActionAgent,
  ref: string,
  resourceId: string,
  metadata: StreamMetadata
) {
  const groupBy = metadata && metadata.groupBy;
  actionAgent.registerAction(ref, resourceId, {
    pipelineURI: createResourceUri(resourceId),
    groupBy,
  });
}
