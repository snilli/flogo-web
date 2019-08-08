import { reduce, toInteger } from 'lodash';
import { normalizeTaskName } from '@flogo-web/lib-client/common';

import { Item } from '../interfaces';

export function uniqueStageName(stageName: string, ...stageDictionaries) {
  // TODO for performance pre-normalize and store task names?
  const newNormalizedName = normalizeTaskName(stageName);

  const allStages = Object.assign({}, ...stageDictionaries);

  // search for the greatest index in all the flow
  const greatestIndex = reduce(
    allStages,
    (greatest: number, stage: any) => {
      const currentNormalized = normalizeTaskName(stage.name);
      let repeatIndex = 0;
      if (newNormalizedName === currentNormalized) {
        repeatIndex = 1;
      } else {
        const match = /^(.*)\-([0-9]+)$/.exec(currentNormalized); // some-name-{{integer}}
        if (match && match[1] === newNormalizedName) {
          repeatIndex = toInteger(match[2]);
        }
      }

      return repeatIndex > greatest ? repeatIndex : greatest;
    },
    0
  );

  return greatestIndex > 0 ? `${stageName} (${greatestIndex + 1})` : stageName;
}

export function hasStageWithSameName(stageName, ...stageDictionaries): boolean {
  const allStages = Object.assign({}, ...stageDictionaries);
  return !!Object.values(allStages).find(
    stage => (stage as Item).name.toLowerCase() === stageName.toLowerCase()
  );
}
