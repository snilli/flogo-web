import { isEmpty, pick, fromPairs } from 'lodash';
import { Dictionary } from '@flogo-web/lib-client/core';

import { Item } from '../interfaces';
import { FlogoStreamState } from './stream.state';
import { ROOT_TYPES } from '../../shared/mapper/constants';

/**
 * When stream schema's output change we need to remove the task mappings that were referencing them
 * @param state
 */
export function cleanDanglingTaskOutputMappings(state: FlogoStreamState) {
  let outputNames =
    state.metadata && state.metadata.output
      ? state.metadata.output.map(o => o.name)
      : null;
  if (!outputNames) {
    return state;
  }

  outputNames = normalizeOutputs(outputNames);

  const cleanItems = itemCleaner(outputNames);

  const mainItems = cleanItems(state.mainItems);
  state = { ...state, mainItems };

  return state;
}

function itemCleaner(
  outputNames: string[]
): (items: Dictionary<Item>) => Dictionary<Item> {
  const hasMapping = ([taskId, task]: [string, Item]) => {
    return !isEmpty(task.output);
  };
  return (items: Dictionary<Item>) => cleanTasks(items, outputNames, hasMapping);
}

function cleanTasks(
  items: Dictionary<Item>,
  outputNames: string[],
  shouldClean: ([taskId, task]: [string, Item]) => boolean
): Dictionary<Item> {
  const changed: Array<[string, Item]> = Object.entries(items)
    .filter(shouldClean)
    .map(([taskId, task]: [string, Item]) => {
      return [
        taskId,
        {
          ...task,
          output: pick(task.output, outputNames),
        },
      ] as [string, Item];
    });

  if (changed.length > 0) {
    items = {
      ...items,
      ...fromPairs(changed),
    };
  }
  return items;
}

function normalizeOutputs(outputs) {
  return outputs.map(output => `$${ROOT_TYPES.PIPELINE}.${output}`);
}
