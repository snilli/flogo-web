import { FlogoAppModel, Resource, ContributionType } from '@flogo-web/core';
import {
  FlogoPlugin,
  PluginServer,
  ResourceImportContext,
  HandlerImportContext,
  HandlerExportContext,
  HookContext,
  ResourceExportContext,
} from '@flogo-web/lib-server/core';
import { StreamData } from '@flogo-web/plugins/stream-core';

import { exportStreamResource, registerAction } from './export';
import { importHandler } from './import';

const RESOURCE_TYPE = 'stream';
const RESOURCE_REF = 'github.com/project-flogo/stream';

export const streamPlugin: FlogoPlugin = {
  register(server: PluginServer) {
    // register resource type
    server.resources.addType({
      type: RESOURCE_TYPE,
      ref: RESOURCE_REF,
      import: {
        resource(data: any, context: ResourceImportContext) {
          return data;
        },
        handler(handler: FlogoAppModel.Handler, context: HandlerImportContext) {
          return importHandler(handler, context);
        },
      },
      export: {
        resource(resource: Resource<StreamData>, context: ResourceExportContext) {
          const ref = context.refAgent.getAliasRef(ContributionType.Action, RESOURCE_REF);
          registerAction(context.actionAgent, ref, resource.id, resource.metadata);
          return exportStreamResource(resource, context);
        },
        handler(handler: FlogoAppModel.NewHandler, context: HandlerExportContext) {
          handler.action = {
            ...handler.action,
            id: context.actionAgent.getActionId(context.resource.id),
            settings: undefined,
            ref: undefined,
          };
          return handler;
        },
      },
    });

    // register resource hooks
    // this is optional, you can remove it if your resource does not need hooks
    server.resources.useHooks({
      before: {
        create(context: HookContext) {
          if (context.resource.type === RESOURCE_TYPE) {
            console.log(`before creating resource of type ${context.resource.type}`);
          } else {
            console.log(`ignoring resources of type ${context.resource.type}`);
          }
        },
      },
    });
  },
};
