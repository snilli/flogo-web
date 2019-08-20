import { isEmpty } from 'lodash';

import { Resource, FlogoAppModel, MetadataAttribute, Metadata } from '@flogo-web/core';
import { ResourceExportContext } from '@flogo-web/lib-server/core';
import { StreamResourceModel, StreamData } from '@flogo-web/plugins/stream-core';

import { formatStages } from './format-stages';

export function exportStreamResource(
  fromResource: Resource<StreamData>,
  context: ResourceExportContext
): FlogoAppModel.Resource<StreamResourceModel.StreamResourceData> {
  const formattedMetadata = formatMetadata(fromResource.metadata);
  const formattedStages = formatStages(fromResource.data || {}, context.refAgent);
  const { groupBy } = fromResource.metadata as any;
  return {
    id: fromResource.id,
    data: {
      name: fromResource.name,
      description: !isEmpty(fromResource.description)
        ? fromResource.description
        : undefined,
      metadata: !isEmpty(formattedMetadata) ? formattedMetadata : undefined,
      stages: !isEmpty(formattedStages) ? formattedStages : undefined,
      /* Adding the groupBy to the data which will be removed while cleaning the resource */
      groupBy: !isEmpty(groupBy) ? groupBy : undefined,
    },
  };
}

/* streams-plugin-todo: move formatMetadata to @flogo-web/lib-server/core */
const exportMetadataAttribute = ({
  name,
  type,
}: MetadataAttribute): MetadataAttribute => ({
  name,
  type,
});

function formatMetadata(
  actionMetadata: Metadata
): StreamResourceModel.StreamResourceData['metadata'] {
  return ['input', 'output'].reduce((formattedMetadata, type) => {
    if (!isEmpty(actionMetadata[type])) {
      formattedMetadata[type] = actionMetadata[type].map(exportMetadataAttribute);
    }
    return formattedMetadata;
  }, {});
}
