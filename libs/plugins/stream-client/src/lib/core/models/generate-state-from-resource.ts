import { fromPairs } from 'lodash';

import { normalizeTriggersAndHandlersForResource } from '@flogo-web/lib-client/core';
import { ContributionSchema } from '@flogo-web/core';

import { makeStageItems, makeGraphNodes } from './graph-and-items';

/* streams-plugin-todo: Replace any with API resource interface of Stream */
export function generateStateFromResource(resource: any, schemas: ContributionSchema[]) {
  const schemaDefs = fromPairs(schemas.map(schema => [schema.ref, schema]));
  //streams-plugin-todo: check about currentSelection in resource
  const {
    id,
    name,
    description,
    app,
    triggers: originalTriggers,
    currentSelection,
  } = resource;
  const { triggers, handlers } = normalizeTriggersAndHandlersForResource(
    id,
    originalTriggers
  );
  const stages = (resource && resource.data && resource.data.stages) || [];
  const items = makeStageItems(stages, schemaDefs);
  const graph = makeGraphNodes(stages);
  return {
    id,
    name,
    description,
    app,
    triggers,
    handlers,
    schemas: schemaDefs,
    mainGraph: graph,
    mainItems: items,
    currentSelection,
  };
}
