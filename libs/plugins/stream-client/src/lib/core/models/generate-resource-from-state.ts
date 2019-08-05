import { isEmpty } from 'lodash';

import { parseMetadata } from '@flogo-web/lib-client/core';
import { Metadata } from '@flogo-web/core';

import { FlogoStreamState } from '../state';
import { createStagesFromGraph } from './graph-and-items';

/* streams-plugin-todo: This function should return the Stream api structure */
export function generateResourceFromState(state: FlogoStreamState): any {
  const metadata = normalizeMetadata(state.metadata);
  const stages = createStagesFromGraph(state.mainItems, state.mainGraph);
  return {
    id: state.id,
    type: 'stream',
    name: state.name,
    description: state.description,
    metadata: metadata || {},
    data: stages ? { stages } : {},
  };
}

function normalizeMetadata(source: Metadata): Metadata {
  if (isEmpty(source)) {
    return null;
  }
  return parseMetadata(source);
}
