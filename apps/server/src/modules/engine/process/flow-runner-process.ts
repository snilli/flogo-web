import { injectable, inject } from 'inversify';
import { Logger } from 'winston';
import { TOKENS } from '../../../core';
import { EngineProcess } from './engine-process';
import { resolveFlowRunnerEnv } from './resolve-flow-runner-env';
import { setupStdioRedirection } from './logging';

@injectable()
export class FlowRunnerProcess extends EngineProcess {
  constructor(@inject(TOKENS.EngineLogger) logger: Logger) {
    super({
      resolveEnv: resolveFlowRunnerEnv,
      afterStart: ({ projectDetails, subprocess }) => {
        setupStdioRedirection(subprocess, projectDetails.projectName, {
          logger,
        });
      },
    });
  }
}
