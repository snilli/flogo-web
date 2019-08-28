import {
  HandlerImportContext,
  parseResourceIdFromResourceUri,
} from '@flogo-web/lib-server/core';
import { Handler, FlogoAppModel } from '@flogo-web/core';

import { STREAM_POINTER } from '../constants';

export function importHandler(handler, context: HandlerImportContext): Handler {
  const rawHandler: FlogoAppModel.NewHandler = context && context.rawHandler;
  const actionDetails = context.actionsManager.getSettingsForId(rawHandler.action.id);
  return {
    ...handler,
    resourceId: parseResourceIdFromResourceUri(actionDetails[STREAM_POINTER]),
  };
}
