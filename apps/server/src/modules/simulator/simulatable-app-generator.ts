import { injectable } from 'inversify';
import { cloneDeep } from 'lodash';

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
    header: true,
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
    app.resources.push(resource);
    app.triggers.push(generateTrigger({ ...opts, resourceId }));
    const transformedApp = await this.appExporter.export(app);
    transformedApp.imports.push('github.com/project-flogo/stream/service/telemetry');
    return transformedApp;
  }
}

function generateTrigger(options) {
  return {
    id: 'flogo-timer',
    ref: 'github.com/skothari-tibco/csvtimer',
    settings: {
      control: true,
      port: options.port,
    },
    handlers: [generateHandler(options)],
  };
}

function generateHandler({ resourceId, filePath, repeatInterval }) {
  const handler = cloneDeep(BASE_HANDLER_SETTINGS);
  // const actionMappings = prepareInputMappings();
  const actionMappings = {
    input: {
      input: '$.data',
    },
  };
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

/*function prepareInputMappings() {
  return {
    input: {},
  };
}*/

/*function getMock(filePath, port, repeatInterval) {
  return {
    name: '20190828-1542',
    type: 'flogo:app',
    version: '0.0.1',
    description: '',
    appModel: '1.1.0',
    imports: [
      // 'github.com/project-flogo/stream/trigger/test-timer testtimer',
      'github.com/skothari-tibco/csvtimer',
      'github.com/project-flogo/stream/activity/filter',
      'github.com/project-flogo/contrib/activity/log',
      'github.com/project-flogo/stream/service/telemetry',
      'github.com/project-flogo/contrib/trigger/rest',
      'github.com/project-flogo/stream',
    ],
    triggers: [
      // {
      //   id: 'flogo-timer',
      //   ref: 'testtimer',
      //   settings: {
      //     port: `${port}`,
      //     control: true,
      //   },
      //   handlers: [
      //     {
      //       settings: {
      //         header: true,
      //         filePath: filePath,
      //         repeatInterval: `${repeatInterval}`,
      //       },
      //       actions: [
      //         {
      //           id: 'simple_agg',
      //           input: {
      //             foo: '=$.data.foo',
      //             bar: '=$.data.bar',
      //           },
      //         },
      //       ],
      //     },
      //   ],
      // },
      {
        id: 'flogo-timer',
        ref: '#csvtimer',
        handlers: [
          {
            settings: {
              header: true,
              filePath,
              repeatInterval: `${repeatInterval}`,
            },
            actions: [
              {
                id: 'simple_agg',
                input: {
                  foo: '=$.data.foo',
                  bar: '=$.data.bar',
                },
              },
            ],
          },
        ],
      },
    ],
    actions: [
      {
        ref: '#stream',
        settings: {
          pipelineURI: 'res://pipeline:simple_filter',
        },
        id: 'simple_agg',
      },
    ],
    resources: [
      {
        id: 'pipeline:simple_filter',
        "filePath": "...local\asf\file.csv"
        data: {
          metadata: {
            input: [
              {
                name: 'foo',
                type: 'integer',
              },
              {
                name: 'bar',
                type: 'integer',
              },
            ],
            output: [
              {
                name: 'test',
                type: 'any',
              },
            ],
          },
          stages: [
            {
              ref: '#filter',
              settings: {
                type: 'non-zero',
                proceedOnlyOnEmit: true,
              },
              input: {
                value: '=$.foo',
              },
            },
            {
              ref: '#log',
              input: {
                message: '=$.value',
              },
              output: {
                'pipeline.test': "='cool'",
              },
            },
          ],
        },
      },
    ],
  };
}*/
