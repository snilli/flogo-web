import { filter, keys, map, max, toNumber } from 'lodash';

import { FLOGO_TASK_TYPE } from '../../../core';

export function calculateNextId(items: any, parseInput?) {
  let maxCount;
  const ids = keys(items);
  const startPoint = 2; // stageID 1 is reserved for the rootStage

  const stageIDs = map(
    filter(ids, (id: string) => {
      const type = items[id].type;
      return type === FLOGO_TASK_TYPE.TASK || type === FLOGO_TASK_TYPE.TASK_ROOT;
    }),
    (id: string) => {
      // if parseInput callback is provided then parse the decoded stage ID to get the number string
      const numberString = parseInput ? parseInput(id) : id;
      // Convert the numberString to number
      return toNumber(numberString);
    }
  );

  const currentMax = max(stageIDs);

  if (currentMax) {
    maxCount = '' + (currentMax + 1);
  } else {
    maxCount = '' + startPoint;
  }
  return maxCount;
}
