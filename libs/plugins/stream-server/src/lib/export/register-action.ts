import { ExportActionAgent } from '@flogo-web/lib-server/core';
import { StreamMetadata } from '@flogo-web/plugins/stream-core';
import { createResourceUri } from '@flogo-web/core';
import { STREAM_POINTER } from '../constants';

export function registerAction(
  actionAgent: ExportActionAgent,
  ref: string,
  resourceId: string,
  metadata: StreamMetadata
) {
  const groupBy = metadata && metadata.groupBy;
  actionAgent.registerAction(ref, resourceId, {
    [STREAM_POINTER]: createResourceUri(resourceId),
    groupBy,
  });
}
