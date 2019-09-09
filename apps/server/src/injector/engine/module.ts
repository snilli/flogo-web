import { ContainerModule, interfaces } from 'inversify';
import { TOKENS } from '../../core';
import { Engine, getInitializedEngine } from '../../modules/engine';
import { config } from '../../config';

export const EngineModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(TOKENS.EngineProvider).toProvider<Engine>(() => {
    return (defaultEnginePath = config.defaultEngine.path) => {
      return getInitializedEngine(defaultEnginePath);
    };
  });
});
