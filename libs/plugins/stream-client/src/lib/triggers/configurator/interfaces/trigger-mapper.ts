import { Tabs } from '../../../shared/tabs/models/tabs.model';
import { Metadata } from '@flogo-web/core';
import { HandlerMappings } from './configurator';

export interface MapperStatus {
  flowMetadata: Metadata;
  triggerSchema: any;
  handler: any;
  tabs: Tabs;
  changedMappings?: HandlerMappings;
}

export interface TriggerChanges {
  isValid: boolean;
  changedMappings?: HandlerMappings;
}
