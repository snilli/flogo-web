import { FlogoAppModel, TriggerSchema } from '@flogo-web/core';
import { TriggerHandler, Trigger } from '@flogo-web/lib-client/core';

import {
  InstalledFunctionSchema,
} from '../../../core';
import { Metadata } from "@flogo-web/core";

export interface ConfiguratorStatus {
  disableSave?: boolean;
  isOpen?: boolean;
  triggers?: TriggerStatus[];
  selectedTriggerId?: string;
}

export interface TriggerStatus {
  id?: string;
  isValid?: boolean;
  isDirty?: boolean;
  name?: string;
}

export interface CurrentTriggerState {
  appId: string;
  streamMetadata: Metadata;
  schema: TriggerSchema;
  handler: TriggerHandler;
  trigger: Trigger;
  // todo: define
  fields: any;
  appProperties?: FlogoAppModel.AppProperty[];
  functions: InstalledFunctionSchema[];
}
