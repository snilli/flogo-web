import { injectable } from 'inversify';
import { cloneDeep, isArray } from 'lodash';

import { SimulationInputMapping, MetadataAttribute } from '@flogo-web/core';

import { AppExporter } from '../apps';
import { ResourceService } from '../resources';

const BASE_APP = {
  name: 'flogo-simulation',
  type: 'flogo:app',
  appModel: '1.1.0',
  triggers: [],
  resources: [],
};

const BASE_HANDLER_SETTINGS = {
  settings: {
    columnNameAsKey: true,
  },
};

@injectable()
export class SimulatableAppGenerator {
  constructor(
    private resourceService: ResourceService,
    private appExporter: AppExporter
  ) {}

  async generateFor(
    resourceId: string,
    options: {
      filePath: string;
      port: string;
      repeatInterval?: string;
      mappingsType?: SimulationInputMapping;
    }
  ) {
    const repeatInterval = options.repeatInterval || 500;
    const opts = {
      ...options,
      repeatInterval,
    };
    // return getMock(options.filePath, options.port, repeatInterval);
    const app = cloneDeep(BASE_APP);
    const resource = await this.resourceService.getResource(resourceId);
    const { input: resourceInputs } = resource && resource.metadata;
    app.resources.push(resource);
    app.triggers.push(generateTrigger({ ...opts, resourceId, resourceInputs }));
    const transformedApp = await this.appExporter.export(app);
    transformedApp.imports.push(
      'github.com/project-flogo/stream/service/telemetry',
      'github.com/project-flogo/catalystml-flogo/action',
      'github.com/project-flogo/catalystml-flogo/activity/inference',
      'github.com/project-flogo/catalystml-flogo/operations/cleaning',
      'github.com/project-flogo/catalystml-flogo/operations/math',
      'github.com/project-flogo/catalystml-flogo/operations/categorical',
      'github.com/project-flogo/catalystml-flogo/operations/retyping'
    );
    return transformedApp;
  }
}

function generateTrigger(options) {
  return {
    id: 'flogo-tester',
    ref: 'github.com/project-flogo/stream/trigger/streamtester',
    settings: {
      port: options.port,
    },
    handlers: [generateHandler(options)],
  };
}

function generateHandler(options) {
  const { resourceId, filePath, repeatInterval, mappingsType, resourceInputs } = options;
  const handler = cloneDeep(BASE_HANDLER_SETTINGS);
  const actionMappings = {
    input: prepareInputMappings(mappingsType, resourceInputs),
  };
  /*const actionMappings = {
    input: {
      input: '=$.data',
    },
  };*/
  return {
    ...handler,
    settings: {
      ...handler.settings,
      repeatInterval,
      filePath,
    },
    resourceId,
    actionMappings,
  };
}

function prepareInputMappings(
  mappingsType: SimulationInputMapping,
  inputs: MetadataAttribute[]
) {
  if (!inputs || !isArray(inputs) || inputs.length < 1) {
    return;
  }

  switch (mappingsType) {
    case SimulationInputMapping.Complex:
    case SimulationInputMapping.Separate:
      return inputs.reduce((mappings, attr) => {
        mappings[attr.name] = `=$.data.${attr.name}`;
        return mappings;
      }, {});
    default:
      const [input] = inputs;
      return {
        [input.name]: '=$.data',
      };
  }
}
