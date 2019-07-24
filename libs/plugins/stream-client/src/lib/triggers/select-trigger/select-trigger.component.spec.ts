import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, Injectable } from '@angular/core';

import {
  TriggersService,
  ContributionsService,
  HttpUtilsService,
} from '@flogo-web/lib-client/core';
import { FakeRootLanguageModule } from '@flogo-web/lib-client/language/testing';

import { FlogoProfileService } from '../../core';
import { TriggersModule } from '../triggers.module';
import { FlogoSelectTriggerComponent } from './select-trigger.component';

describe('FlogoSelectTrigger component', () => {
  let comp: FlogoSelectTriggerComponent;
  let fixture: ComponentFixture<FlogoSelectTriggerComponent>;

  const existingMock = [
    {
      ref: 'some_path_to_repo/trigger/coap',
      name: 'Simple COAP Trigger',
      description: 'Description of Simple COAP Trigger',
      id: 1,
    },
    {
      ref: 'some_path_to_repo/trigger/mqtt',
      name: 'Receive MQTT Message',
      description: 'MQTT Message description',
      id: 2,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FakeRootLanguageModule, TriggersModule],
      providers: [
        { provide: FlogoProfileService, useClass: FlogoProfileServiceMock },
        { provide: TriggersService, useClass: TriggersApiServiceMock },
        { provide: ContributionsService },
        HttpUtilsService,
      ],
    });
    return TestBed.compileComponents();
  });

  it('Should display 4 installed triggers', done => {
    fixture = TestBed.createComponent(FlogoSelectTriggerComponent);
    comp = fixture.componentInstance;
    comp.appId = 'foo';
    fixture.detectChanges();
    comp.loadInstalledTriggers().then(() => {
      fixture.detectChanges();
      const res: Array<DebugElement> = fixture.debugElement.queryAll(
        By.css('.trigger__content')
      );
      expect(res.length).toEqual(4);
      done();
    });
  });

  it('Should display 2 existing triggers', done => {
    fixture = TestBed.createComponent(FlogoSelectTriggerComponent);
    comp = fixture.componentInstance;
    const existing = function() {
      return Promise.resolve(existingMock);
    };
    comp.getExistingTriggers = existing;
    comp.loadInstalledTriggers().then(() => {
      fixture.detectChanges();
      const res: Array<DebugElement> = fixture.debugElement.queryAll(
        By.css('.arrow-div li')
      );
      expect(res.length).toEqual(2);
      done();
    });
  });

  it('Should select an installed trigger', done => {
    fixture = TestBed.createComponent(FlogoSelectTriggerComponent);
    comp = fixture.componentInstance;
    const existing = function() {
      return Promise.resolve([]);
    };
    comp.addTriggerToAction.subscribe(data => {
      expect(data.triggerData.description).toEqual('Simple CoAP Trigger');
      done();
    });
    comp.getExistingTriggers = existing;
    comp.loadInstalledTriggers().then(() => {
      fixture.detectChanges();
      const res: Array<DebugElement> = fixture.debugElement.queryAll(
        By.css('.trigger__content')
      );
      res[0].nativeElement.click(res[0]);
    });
  });

  it('Should select an existing trigger', done => {
    fixture = TestBed.createComponent(FlogoSelectTriggerComponent);
    comp = fixture.componentInstance;
    const existing = function() {
      return Promise.resolve(existingMock);
    };
    comp.addTriggerToAction.subscribe(data => {
      expect(data.triggerData.description).toEqual('Description of Simple COAP Trigger');
      done();
    });
    comp.getExistingTriggers = existing;
    comp.loadInstalledTriggers().then(() => {
      fixture.detectChanges();
      const res: Array<DebugElement> = fixture.debugElement.queryAll(
        By.css('.arrow-div li')
      );
      res[0].nativeElement.click(res[0]);
    });
  });
});

class FlogoProfileServiceMock {
  private triggers;

  constructor() {
    this.triggers = [
      {
        id: 'tibco-coap',
        name: 'tibco-coap',
        version: '0.0.1',
        title: 'Receive CoAP Message',
        description: 'Simple CoAP Trigger',
        homepage: '',
        ref: 'some_path_to_repo/trigger/coap',
        settings: [
          {
            name: 'port',
            type: 'integer',
            required: true,
          },
        ],
        outputs: [
          {
            name: 'queryParams',
            type: 'params',
          },
          {
            name: 'payload',
            type: 'string',
          },
        ],
        handler: {
          settings: [
            {
              name: 'method',
              type: 'string',
              required: true,
              allowed: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            },
            {
              name: 'path',
              type: 'string',
              required: true,
            },
            {
              name: 'autoIdReply',
              type: 'boolean',
            },
          ],
        },
      },
      {
        id: 'tibco-mqtt',
        name: 'tibco-mqtt',
        version: '0.0.1',
        title: 'Receive MQTT Message',
        description: 'Simple MQTT Trigger',
        homepage: 'some_path_to_repo/tree/master/trigger/mqtt',
        ref: 'some_path_to_repo/trigger/mqtt',
        settings: [
          {
            name: 'broker',
            type: 'string',
          },
          {
            name: 'id',
            type: 'string',
          },
          {
            name: 'user',
            type: 'string',
          },
          {
            name: 'password',
            type: 'string',
          },
          {
            name: 'store',
            type: 'string',
          },
          {
            name: 'topic',
            type: 'string',
          },
          {
            name: 'qos',
            type: 'number',
          },
          {
            name: 'cleansess',
            type: 'boolean',
          },
        ],
        outputs: [
          {
            name: 'message',
            type: 'string',
          },
        ],
        handler: {
          settings: [
            {
              name: 'topic',
              type: 'string',
            },
          ],
        },
      },
      {
        id: 'tibco-rest',
        name: 'tibco-rest',
        version: '0.0.1',
        title: 'Receive HTTP Message',
        description: 'Simple REST Trigger',
        homepage: 'some_path_to_repo/tree/master/trigger/rest',
        ref: 'some_path_to_repo/trigger/rest',
        settings: [
          {
            name: 'port',
            type: 'integer',
            required: true,
          },
        ],
        outputs: [
          {
            name: 'params',
            type: 'params',
          },
          {
            name: 'pathParams',
            type: 'params',
          },
          {
            name: 'queryParams',
            type: 'params',
          },
          {
            name: 'content',
            type: 'object',
          },
        ],
        handler: {
          settings: [
            {
              name: 'method',
              type: 'string',
              required: true,
              allowed: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            },
            {
              name: 'path',
              type: 'string',
              required: true,
            },
            {
              name: 'autoIdReply',
              type: 'boolean',
            },
            {
              name: 'useReplyHandler',
              type: 'boolean',
            },
          ],
        },
      },
      {
        id: 'tibco-timer',
        name: 'tibco-timer',
        version: '0.0.1',
        title: 'Timer',
        description: 'Simple Timer trigger',
        homepage: 'some_path_to_repo/tree/master/trigger/timer',
        ref: 'some_path_to_repo/trigger/timer',
        settings: [],
        outputs: [
          {
            name: 'params',
            type: 'params',
          },
          {
            name: 'content',
            type: 'object',
          },
        ],
        handler: {
          settings: [
            {
              name: 'repeating',
              type: 'string',
            },
            {
              name: 'startDate',
              type: 'string',
            },
            {
              name: 'hours',
              type: 'string',
            },
            {
              name: 'minutes',
              type: 'string',
            },
            {
              name: 'seconds',
              type: 'string',
            },
          ],
        },
      },
    ];
  }

  getTriggers() {
    return Promise.resolve(this.triggers);
  }

  installTriggers(urls: string[]) {
    throw new Error('installTriggers not implemented');
  }
}

@Injectable()
export class TriggersApiServiceMock {
  constructor() {}

  createTrigger(appId, trigger: any) {
    return Promise.resolve({});
  }

  listTriggersForApp(appId) {
    const existing = [
      {
        ref: 'some_path_to_repo/trigger/coap',
        id: 1,
      },
      {
        ref: 'some_path_to_repo/trigger/mqtt',
        id: 2,
      },
      {
        ref: 'some_path_to_repo/trigger/rest',
        id: 3,
      },
    ];

    return Promise.resolve(existing);
  }
}
