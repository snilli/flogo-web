import { isEmpty } from 'lodash';

import { parseMetadata } from '@flogo-web/lib-client/core';
import { Metadata, MetadataAttribute } from '@flogo-web/core';

import { FlogoStreamState } from '../state';
import { createStagesFromGraph } from './graph-and-items';

/* streams-plugin-todo: This function should return the Stream api structure */
export function generateResourceFromState(state: FlogoStreamState): any {
  const metadata = normalizeMetadata(state.metadata);
  const stages = createStagesFromGraph(state.mainItems, state.mainGraph);
  const streamResource = {
    id: state.id,
    type: 'stream',
    name: state.name,
    description: state.description,
  } as any;
  if (metadata) {
    streamResource.metadata = metadata;
  }

  if (stages) {
    streamResource.data = {
      stages,
    };
  }
  return streamResource;
}

function normalizeMetadata(source: Metadata): Metadata {
  if (isEmpty(source)) {
    return null;
  }
  const { input, output } = parseMetadata(source);
  const groupedBy: MetadataAttribute = (source.input || []).find(
    srcInput => srcInput.groupBy
  );
  return {
    input: input.map(normalizedInput =>
      groupedBy && groupedBy.name === normalizedInput.name
        ? { ...normalizedInput, groupBy: true }
        : normalizedInput
    ),
    output,
  };
}
