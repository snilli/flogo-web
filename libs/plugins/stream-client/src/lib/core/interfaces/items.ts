import { TASK_TYPE } from '@flogo-web/lib-client/core';

export interface Item {
  id: string;
  type: TASK_TYPE;
  ref: string;
  name: string;
  description: string;
  inputMappings: { [inputName: string]: any };
  output: { [outputName: string]: any };
  activitySettings?: { [settingName: string]: any };
  return?: boolean;
}
