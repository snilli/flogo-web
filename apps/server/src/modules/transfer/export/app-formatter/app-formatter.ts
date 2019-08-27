import { isEmpty, pick } from 'lodash';
import {
  ResourceExportContext,
  Resource,
  ExportRefAgent,
  ExportActionAgent,
} from '@flogo-web/lib-server/core';
import {
  App,
  FlogoAppModel,
  ContributionSchema,
  ContributionType,
  Handler,
  Trigger,
} from '@flogo-web/core';

import { ResourceExporterFn, HandlerExporterFn } from '../resource-exporter-fn';
import { makeHandlerFormatter } from './handler-format';
import { ExportedResourceInfo } from './exported-resource-info';
import { createRefAgent, RefAgent } from '../ref-agent';
import { APP_MODEL_VERSION } from '../../../../common/constants';
import { createActionAgent, ActionAgent } from '../action-agent/create-action-agent';

const TRIGGER_KEYS: Array<keyof FlogoAppModel.Trigger> = [
  'id',
  'ref',
  'name',
  'description',
  'settings',
  'handlers',
];

export class AppFormatter {
  constructor(
    private contributionSchemas: Map<string, ContributionSchema>,
    private resourceTypeToRef: Map<string, string>,
    private exporter: {
      resource: ResourceExporterFn;
      handler: HandlerExporterFn;
    }
  ) {}

  format(app: App, resourceIdReconciler: Map<string, Resource>): FlogoAppModel.App {
    const refAgent: RefAgent = createRefAgent(this.contributionSchemas, app.imports);
    const actionAgent: ActionAgent = createActionAgent();
    const exportContext: ResourceExportContext = {
      contributions: this.contributionSchemas,
      resourceIdReconciler,
      refAgent,
      actionAgent,
    };

    const { resources, resourceInfoLookup } = this.formatResources(
      app.resources,
      exportContext
    );

    const formattedTriggers = this.formatTriggers(
      app.triggers,
      refAgent,
      this.makeHandlerFormatter(
        resourceIdReconciler,
        resourceInfoLookup,
        refAgent,
        actionAgent
      )
    );

    const allImports = refAgent.formatImports();
    const allActions = actionAgent.getAllActions();

    return {
      name: app.name,
      type: 'flogo:app',
      version: app.version,
      appModel: APP_MODEL_VERSION,
      description: app.description,
      properties: !isEmpty(app.properties) ? app.properties : undefined,
      imports: !isEmpty(allImports) ? allImports : undefined,
      triggers: !isEmpty(formattedTriggers) ? formattedTriggers : undefined,
      actions: !isEmpty(allActions) ? allActions : undefined,
      resources: !isEmpty(resources) ? resources : undefined,
    };
  }

  formatResources(resources: Resource[], exportContext: ResourceExportContext) {
    const resourceInfoLookup = new Map<string, ExportedResourceInfo>();
    const exportedResources: FlogoAppModel.Resource[] = [];
    resources.forEach(resource => {
      const exportedResource = this.exporter.resource(resource, exportContext);
      resourceInfoLookup.set(resource.id, {
        resource: exportedResource,
        type: resource.type,
        ref: this.resourceTypeToRef.get(resource.type),
      });
      exportedResources.push(exportedResource);
    });
    return { resources: exportedResources, resourceInfoLookup };
  }

  formatTriggers(
    triggers: Trigger[],
    refAgent: ExportRefAgent,
    handlerFormatter: (trigger: Trigger) => (handler: Handler) => FlogoAppModel.Handler
  ): FlogoAppModel.Trigger[] {
    return triggers
      .filter(trigger => !isEmpty(trigger.handlers))
      .map(trigger => {
        return pick(
          {
            ...trigger,
            settings: !isEmpty(trigger.settings) ? trigger.settings : undefined,
            handlers: trigger.handlers.map(handlerFormatter(trigger)),
            ref: refAgent.getAliasRef(ContributionType.Trigger, trigger.ref),
          },
          TRIGGER_KEYS
        ) as FlogoAppModel.Trigger;
      });
  }

  private makeHandlerFormatter(
    resourceIdReconciler: Map<string, Resource>,
    resourceInfoLookup: Map<string, ExportedResourceInfo>,
    refAgent: ExportRefAgent,
    actionAgent: ExportActionAgent
  ) {
    return makeHandlerFormatter({
      exportHandler: this.exporter.handler,
      contributionSchemas: this.contributionSchemas,
      refAgent: refAgent,
      actionAgent,
      getResourceInfo: oldResourceId =>
        resourceInfoLookup.get(resourceIdReconciler.get(oldResourceId).id),
    });
  }
}
