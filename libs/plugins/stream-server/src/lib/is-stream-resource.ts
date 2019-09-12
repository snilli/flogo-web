import { Resource } from '@flogo-web/core';
import { RESOURCE_TYPE } from './constants';

export function isStreamResource(r: Partial<Resource>): boolean {
  return r && r.type === RESOURCE_TYPE;
}
