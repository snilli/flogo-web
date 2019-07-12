import { normalizeTriggersAndHandlersForResource } from '@flogo-web/lib-client/core';
import { ContributionSchema } from '@flogo-web/core';

/* streams-plugin-todo: Replace any with API resource interface of Stream */
export function generateStateFromResource(resource: any, schemas: ContributionSchema[]) {
  const { id, name, description, app, triggers: originalTriggers } = resource;
  const { triggers, handlers } = normalizeTriggersAndHandlersForResource(
    id,
    originalTriggers
  );
  return {
    id,
    name,
    description,
    app,
    triggers,
    handlers,
    schemas: null,
    mainGraph: null,
    mainItems: null,
  };
}
