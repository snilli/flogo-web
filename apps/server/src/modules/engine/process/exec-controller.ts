import path from 'path';
import execa from 'execa';

import { fileExists } from '../../../common/utils/file';
import { RunningProcess } from './running-process';
import { resolveFlowRunnerEnv } from './resolve-flow-runner-env';

const DEFAULT_ENV = {
  FLOGO_LOG_LEVEL: 'DEBUG',
};

export function execEngine(
  enginePath: string,
  engineName: string,
  // todo: add type
  options: {
    binDir?: string;
    env?: { [key: string]: any };
  } = {}
): RunningProcess {
  options = {
    binDir: 'bin',
    env: {
      ...DEFAULT_ENV,
      ...options.env,
    },
    ...options,
  };
  options = Object.assign({}, { binDir: 'bin' }, options);
  console.log(`[info] starting engine ${engineName}`);

  const binPath = path.join(enginePath, options.binDir);
  console.log('[info] defaultEngineBinPath: ', binPath);

  if (!fileExists(path.join(binPath, engineName))) {
    const errorMessage = `[error] engine ${engineName} doesn't exist`;
    console.log(errorMessage);
    throw new Error(errorMessage);
  }

  const engineProcess = startProcess(engineName, binPath, options.env);

  let resolveClosed;
  engineProcess.whenClosed = new Promise(resolve => {
    resolveClosed = resolve;
  });
  engineProcess.finally(() => {
    engineProcess.closed = true;
    resolveClosed();
  });

  return engineProcess;
}

function startProcess(engineName: string, cwd: string, env: Record<string, string>) {
  const command = engineName;
  // let args = [];
  // todo: test if it actually works in windows
  // if (processHost.isWindows()) {
  //   command = process.env.comspec;
  //   args = ['/c', engineName];
  // }
  return execa(command, [] /* args */, {
    cwd,
    env,
    extendEnv: true,
    shell: true,
  }) as RunningProcess;
}
