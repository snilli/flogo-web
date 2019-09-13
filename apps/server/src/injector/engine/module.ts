import { ContainerModule, interfaces } from 'inversify';
import { TOKENS } from '../../core';
import { Engine, getInitializedEngine, EngineProcess } from '../../modules/engine';
import { config } from '../../config';
import { FlowRunnerProcess } from '../../modules/engine/process/flow-runner-process';

export const EngineModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(TOKENS.EngineProvider).toProvider<Engine>(() => {
    return (defaultEnginePath = config.defaultEngine.path) => {
      return getInitializedEngine(defaultEnginePath);
    };
  });
  bind(EngineProcess).to(FlowRunnerProcess);
});
