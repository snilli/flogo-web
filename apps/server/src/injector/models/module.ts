import { ContainerModule, interfaces } from 'inversify';
import { TOKENS } from '../../core';

import { ResourceService } from '../../modules/resources';
import {
  AppsService,
  AppImporter,
  AppExporter,
  AppTriggersService,
  HandlersService,
} from '../../modules/apps';
import { AllContribsService } from '../../modules/all-contribs';
import { ContributionManager } from '../../modules/contributions';
import { ResourceExporter } from '../../modules/transfer/export/resource-exporter';

export const ModelsModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(ResourceService).toSelf();
  bind(AppImporter).toSelf();
  bind(AppExporter).toSelf();
  bind(AppsService).toSelf();
  bind(AppTriggersService).toSelf();
  bind(HandlersService).toSelf();
  bind(AllContribsService).toSelf();
  bind(ResourceExporter).toSelf();
  bind(TOKENS.ContributionsManager).toConstantValue(ContributionManager);
});
