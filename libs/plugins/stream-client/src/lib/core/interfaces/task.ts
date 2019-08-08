import { Dictionary } from '@flogo-web/lib-client/core';
import { FLOGO_TASK_TYPE } from '../constants';
import { TaskAttributes } from './attribute';

export interface Task {
  id: string;
  type: FLOGO_TASK_TYPE;
  version?: string;
  name?: string;
  activityRef?: string;
  ref?: string;
  description?: string;
  activityType?: string;
  triggerType?: string;
  attributes?: TaskAttributes;
  inputMappings?: Dictionary<any>;
  outputMappings?: Dictionary<any>;
  settings?: {
    iterate?: string;
  };

  activitySettings?: { [settingName: string]: any };
  __props?: {
    [key: string]: any;
    errors?: { msg: string }[];
    warnings?: { msg: string }[];
  }; // internal only properties in design time
  __status?: {
    [key: string]: boolean;
  }; // internal only properties in design time
}
