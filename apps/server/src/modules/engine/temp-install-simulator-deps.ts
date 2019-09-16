import { EngineProjectDetails } from './engine';
import { runShellCMD } from '../../common/utils/process';
import { join } from 'path';

export async function tempInstallSimulatorDeps(engineDetails: EngineProjectDetails) {
  const srcPath = join(engineDetails.path, 'src');
  await runShellCMD(
    'go',
    [
      'mod',
      'edit',
      '-require',
      'github.com/project-flogo/stream@master',
      '-require',
      'github.com/project-flogo/stream/service/telemetry@master',
      '-replace',
      'github.com/project-flogo/stream=github.com/project-flogo/stream@master',
    ],
    { cwd: srcPath }
  );
  await runShellCMD('go', ['install'], { cwd: srcPath });
}
