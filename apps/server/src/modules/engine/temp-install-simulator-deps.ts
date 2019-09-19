import { EngineProjectDetails } from './engine';
import { runShellCMD } from '../../common/utils/process';

export async function tempInstallSimulatorDeps(engineDetails: EngineProjectDetails) {
  await runShellCMD(
    'flogo',
    [
      'install',
      '-r',
      'github.com/project-flogo/stream@master',
      'github.com/project-flogo/stream',
    ],
    { cwd: engineDetails.path }
  );
  await runShellCMD('flogo', ['imports', 'sync'], { cwd: engineDetails.path });
}
