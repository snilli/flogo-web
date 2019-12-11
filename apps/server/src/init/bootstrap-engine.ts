import { getInitializedEngine, EngineProjectDetails } from '../modules/engine';
import { syncTasks } from '../modules/contrib-install-controller/sync-tasks';

export async function boostrapEngine(
  enginePath: string,
  startEngine: (details: EngineProjectDetails) => any
) {
  const engine = await getInitializedEngine(enginePath, {
    forceCreate: !!process.env['FLOGO_WEB_ENGINE_FORCE_CREATION'],
    useEngineConfig: true,
    // todo: Temporary need to load the master version of flogo core
    libVersion: 'master',
  });
  await engine.build({ syncImports: true });
  startEngine(engine.getProjectDetails());
  await syncTasks(engine);
}
