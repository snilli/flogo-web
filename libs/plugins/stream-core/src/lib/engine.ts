import { MetadataAttribute } from '@flogo-web/core';

export namespace StreamResourceModel {
  export interface StreamResourceData {
    name?: string;
    description?: string;
    metadata: {
      input?: MetadataAttribute[];
      output?: MetadataAttribute[];
    };
    stages: Stage[];
    groupBy?: string;
  }

  export interface Stage {
    id?: string;
    name?: string;
    description?: string;
    ref: string;
    input?: {
      [inputName: string]: any;
    };
    output?: {
      [outputName: string]: any;
    };
    settings?: {
      [settingName: string]: any;
    };
  }
}
