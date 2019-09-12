import {
  ResourceHooks,
  createValidator,
  Schemas,
  ValidationError,
  Resource,
  UpdateResourceContext,
} from '@flogo-web/lib-server/core';
import { StreamData } from '@flogo-web/plugins/stream-core';

import { isStreamResource } from './is-stream-resource';
import { StreamSchemas } from './schemas';

const validateStreamData = createValidator(StreamSchemas.internalData, {
  schemas: [StreamSchemas.common, Schemas.v1.common],
});

export const streamHooks: ResourceHooks = {
  before: {
    async create(context) {
      if (isStreamResource(context.resource)) {
        runValidation(context.resource);
      }
      return context;
    },
    async update(context) {
      if (isStreamResource(context.resource)) {
        runValidation(context.resource);
      }
      return context;
    },
  },
};

function runValidation(data: Partial<Resource>) {
  const errors = validateStreamData(data);
  if (errors) {
    throw new ValidationError('Stream data validation error', errors);
  }
}
