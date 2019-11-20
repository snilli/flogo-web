import { getInitializedEngine, EngineProcess } from '../modules/engine';
import { syncTasks } from '../modules/contrib-install-controller/sync-tasks';

export async function boostrapEngine(enginePath: string, engineProcess: EngineProcess) {
  const engine = await getInitializedEngine(enginePath, {
    forceCreate: !!process.env['FLOGO_WEB_ENGINE_FORCE_CREATION'],
    useEngineConfig: true,
  });
  await engine.build();
  // engineProcess.start(engine.getProjectDetails());
  await syncTasks(engine);
}
