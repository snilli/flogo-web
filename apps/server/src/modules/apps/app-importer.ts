import shortid from 'shortid';
import { injectable } from 'inversify';

import { ResourceTypes, ResourcePluginRegistry } from '../../extension';
import { importApp, ImportersResolver } from '../transfer';
import { AllContribsService } from '../all-contribs';

function resourceImportResolver(porting: ResourceTypes): ImportersResolver {
  return {
    byType: (resourceType: string) =>
      porting.isKnownType(resourceType) ? porting.importer(resourceType) : null,
    byRef: (ref: string) => {
      const type = porting.findbyRef(ref);
      return type ? type.import : null;
    },
  };
}

@injectable()
export class AppImporter {
  constructor(
    private pluginRegistry: ResourcePluginRegistry,
    private allContribsService: AllContribsService
  ) {}

  async import(app) {
    const contributions = await this.allContribsService.allByRef();
    const resourceTypes = this.pluginRegistry.resourceTypes;
    const pluginTypesMapping = new Map<string, string>(
      resourceTypes.allTypes().map(t => [t.resourceType, t.type])
    );
    const { id, ...newApp } = await importApp(
      app,
      resourceImportResolver(resourceTypes),
      pluginTypesMapping,
      shortid.generate,
      contributions
    );
    return { id, ...newApp };
  }
}
