import { cloneDeep } from 'lodash';
import { makeAjvContext } from './test-utils';

const triggerSchema = require('../trigger.json');
const commonSchema = require('../common.json');
const flowSchema = require('../flow.json');
const appSchema = require('../app.json');
const actionSchema = require('../action.json');

describe('JSONSchema: App', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  const validSchemas = generateValidSchemas();
  beforeEach(() => {
    testContext.ajvContext = makeAjvContext(
      'app',
      [commonSchema, triggerSchema, flowSchema, actionSchema, appSchema],
      {
        removeAdditional: true,
      }
    );
    testContext.validator = testContext.ajvContext.createValidator();
    testContext.app = {
      name: 'my app',
      type: 'flogo:app',
      version: '0.5.3',
      appModel: '1.1.0',
      description: 'app description',
      triggers: [{ ...validSchemas.trigger }],
      resources: [{ ...validSchemas.resource }],
    };
    testContext.appUnderTest = cloneDeep(testContext.app);
  });

  test('should allow correct app', () => {
    const isValid = testContext.ajvContext.validate(testContext.appUnderTest);
    expect(isValid).toBe(true);
    expect(testContext.appUnderTest).toMatchObject(testContext.app);
  });

  ['name', 'type', 'appModel'].forEach(requiredProp => {
    test(`should require ${requiredProp}`, () => {
      delete testContext.appUnderTest[requiredProp];
      testContext.validator
        .validateAndCreateAsserter(testContext.appUnderTest)
        .assertIsInvalid()
        .assertHasErrorForRequiredProp(requiredProp);
    });
  });

  describe('properties', () => {
    describe('/resources', () => {
      let resourceValidator;
      beforeEach(() => {
        resourceValidator = testContext.ajvContext.createValidatorForSubschema(
          'resource'
        );
      });
      ['data', 'id'].forEach(requiredProp => {
        test(`should require ${requiredProp}`, () => {
          const resourceUnderTest = { ...validSchemas.resource };
          delete resourceUnderTest[requiredProp];
          resourceValidator
            .validateAndCreateAsserter(resourceUnderTest)
            .assertIsInvalid()
            .assertHasErrorForRequiredProp(requiredProp);
        });
      });
      test(`should have valid resources ID `, () => {
        const resourceUnderTest = { ...validSchemas.resource };
        resourceUnderTest.id = 'flowId';
        resourceValidator
          .validateAndCreateAsserter(resourceUnderTest)
          .assertIsInvalid()
          .assertHasErrorForMismatchingPattern('id');
      });
    });
  });
  function generateValidSchemas() {
    const trigger = {
      id: 'trigger1',
      ref: 'some_path_to_repo/trigger/cli',
    };
    const resource = { id: 'flow:test', data: {} };

    return {
      trigger,
      resource,
    };
  }
});
