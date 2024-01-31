import { join as joinPath } from 'path';
import { logger } from '../../../common/logging';
import { runShellCMD } from '../../../common/utils/process';

import { BuildOptions } from '../options';
import { mergeEnvWithOpts } from './merge-env-with-opts';

/**
 * Build the engine.
 *
 * For valid compile os and architecture values see https://golang.org/doc/install/source#environment
 *
 * @param enginePath {string} Path to the engine dir
 * @param opts Options for engine build
 * @param opts.target where to place the generated build. Due to current limitations it will be copied to
 *  specified destination.
 * @param opts.configDir directory that contains the configuration to incorporate into the executable
 * @param opts.optimize {boolean} Optimize for embedded flows. Default false.
 * @param opts.embedConfig {boolean} Embed application config into executable. Default false.
 * @param opts.shimTriggerId {string} Build the app as shim, pass trigger id as value
 * @param opts.compile.os {string} Target operating system. Default value false. Falsy value will fallback to
 *  engine host's default os.
 * @param opts.compile.arch {string} Target compilation architechture. Default value false.
 *  Falsy value will fallback to engine host's default arch.
 * @param opts.copyFlogoDescriptor {boolean} If should also make a copy of the generated flogo.json
 *
 * @returns {Promise<{path: string}>} path to generated binary
 */
export async function build(enginePath, opts: BuildOptions) {
  const defaultEnginePath = joinPath(enginePath);

  opts = _mergeOpts(opts);

  const args = _translateOptsToCommandArgs(opts);
  const env = mergeEnvWithOpts(opts, process.env);

  logger.info('Exec command: go mod tidy');
  await runShellCMD('go', ['mod', 'tidy'], { cwd: joinPath(enginePath, 'src') });

  logger.info(`[log] Build flogo: "flogo build ${args}" compileOpts:`);
  return await runShellCMD('flogo', ['build'].concat(args), {
    cwd: defaultEnginePath,
    env,
  });
}

// ////////////////////////
// Helpers
// ////////////////////////

function _mergeOpts(opts: BuildOptions): BuildOptions {
  return {
    target: undefined,
    optimize: false,
    embedConfig: false,
    file: undefined,
    compile: { os: false, arch: false },
    ...opts,
  };
}

function _translateOptsToCommandArgs(opts: BuildOptions) {
  const args = [] as string[];
  if (opts.optimize) {
    args.push('-o');
  }

  if (opts.embedConfig) {
    args.push('-e');
  }

  if (opts.syncImports) {
    args.push('-s');
  }

  if (opts.file) {
    args.push('-f', opts.file);
  }

  if (opts.shimTriggerId) {
    args.push('--shim', opts.shimTriggerId);
  }

  return args;
}
