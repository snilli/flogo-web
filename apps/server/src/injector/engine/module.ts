import { ContainerModule, interfaces } from 'inversify';
import { TOKENS } from '../../core';
import {
  Engine,
  getInitializedEngine,
  EngineProcessDirector,
} from '../../modules/engine';
import { config } from '../../config';
import {
  SimulationPreparer,
  SimulatableAppGenerator,
  StreamSimulator,
} from '../../modules/simulator';
import { FlowExporter } from '../../modules/transfer/export/flow-exporter';

export const EngineModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(TOKENS.EngineProvider).toProvider<Engine>(() => {
    return (defaultEnginePath = config.defaultEngine.path) => {
      return getInitializedEngine(defaultEnginePath);
    };
  });
  bind(EngineProcessDirector).toSelf();

  bind(TOKENS.StreamSimulationConfig).toDynamicValue(() => config.streamSimulation);
  bind(SimulatableAppGenerator).toSelf();
  bind(SimulationPreparer).toSelf();
  bind(StreamSimulator).toSelf();
  bind(FlowExporter).toSelf();
});
