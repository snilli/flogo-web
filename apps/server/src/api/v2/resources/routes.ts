import Router from 'koa-router';
import { Container } from 'inversify';
import {
  createResourceMiddleware,
  ResourceServiceContextData,
} from './resource-service-middleware';
import { listResources } from './list-resources';
import { listRecent } from './list-recent';
import { createResource } from './create-resource';
import { getResource } from './get-resource';
import { updateResource } from './update-resource';
import { deleteResource } from './delete-resource';
import { getSimulateDataPath } from './get-simulation-data-path';

export function mountResourceRoutes(router: Router, container: Container) {
  const resourceServiceMiddleware = createResourceMiddleware(container);

  router.get('/apps/:appId/resources', resourceServiceMiddleware, listResources);
  router.post('/apps/:appId/resources', resourceServiceMiddleware, createResource);

  const resourceRouter = new Router<any, ResourceServiceContextData>();
  resourceRouter
    .get('/recent', listRecent)
    .get('/simulateDataPath/:resourceId', getSimulateDataPath)
    .get('/:resourceId', getResource)
    .patch('/:resourceId', updateResource)
    .del('/:resourceId', deleteResource);
  router.use(
    '/resources',
    resourceServiceMiddleware,
    resourceRouter.routes(),
    resourceRouter.allowedMethods()
  );
}
