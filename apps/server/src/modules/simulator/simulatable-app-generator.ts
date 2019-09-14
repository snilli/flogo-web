import { injectable } from 'inversify';

@injectable()
export class SimulatableAppGenerator {
  generateFor(
    resourceId: string,
    options: {
      filePath: string;
      port: string;
      repeatInterval?: string;
    }
  ) {
    const repeatInterval = options.repeatInterval || 500;
    return getMock(options.filePath, options.port, repeatInterval);
  }
}

function getMock(filePath, port, repeatInterval) {
  return {
    name: '20190828-1542',
    type: 'flogo:app',
    version: '0.0.1',
    description: '',
    appModel: '1.1.0',
    imports: [
      'github.com/skothari-tibco/csvtimer',
      'github.com/project-flogo/stream/activity/filter',
      'github.com/project-flogo/contrib/activity/log',
      'github.com/project-flogo/stream/service/telemetry',
      'github.com/project-flogo/contrib/trigger/rest',
      'github.com/project-flogo/stream',
    ],
    triggers: [
      {
        id: 'flogo-timer',
        ref: 'github.com/skothari-tibco/csvtimer',
        settings: {
          port: `${port}`,
          control: true,
        },
        handlers: [
          {
            settings: {
              header: true,
              filePath: filePath,
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
}
