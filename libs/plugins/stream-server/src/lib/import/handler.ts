import {
  HandlerImportContext,
  parseResourceIdFromResourceUri,
  validate,
  ValidationError,
} from '@flogo-web/lib-server/core';
import { Handler, FlogoAppModel } from '@flogo-web/core';

import { STREAM_POINTER } from '../constants';
import { StreamSchemas } from '../schemas';

export function importHandler(handler, context: HandlerImportContext): Handler {
  const rawHandler: FlogoAppModel.NewHandler = context && context.rawHandler;
  const actionDetails = context.actionsManager.getSettingsForId(rawHandler.action.id);
  const errors = validate(StreamSchemas.settings, actionDetails);
  if (errors) {
    throw new ValidationError('Stream handler validation error', errors);
  }
  return {
    ...handler,
    resourceId: parseResourceIdFromResourceUri(actionDetails[STREAM_POINTER]),
  };
}
