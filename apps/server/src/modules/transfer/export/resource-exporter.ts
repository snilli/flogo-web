import { injectable } from 'inversify';

import { RESOURCE_TYPE } from '@flogo-web/plugins/flow-server';
import {
  ExportActionAgent,
  Resource,
  ResourceExportContext,
} from '@flogo-web/lib-server/core';

import { ResourceService } from '../../resources';
import { AllContribsService } from '../../all-contribs';
import { ResourcePluginRegistry } from '../../../extension';

@injectable()
export class ResourceExporter {
  constructor(
    private resourceService: ResourceService,
    private pluginRegistry: ResourcePluginRegistry,
    private allContribsService: AllContribsService
  ) {}

  async export(resourceId) {
    const resource = await this.resourceService.findOne(resourceId);
    const contributions = await this.allContribsService.allByRef();
    const resourceTypes = this.pluginRegistry.resourceTypes;
    const resourceExporter = resourceTypes.exporter(RESOURCE_TYPE);
    const exportContext: ResourceExportContext = {
      contributions,
      resourceIdReconciler: new Map<string, Resource>(),
      refAgent: {
        getAliasRef: (contribType: string, ref: string) => ref,
        registerFunctionName: () => {},
      },
      actionAgent: {} as ExportActionAgent,
    };
    return resourceExporter.resource(resource, exportContext);
  }
}
