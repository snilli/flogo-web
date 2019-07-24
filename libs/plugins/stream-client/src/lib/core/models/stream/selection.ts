import { CurrentSelection, SelectionType, TriggerSelection } from '../selection';

export function isTriggerSelection(
  selection: null | CurrentSelection
): selection is TriggerSelection {
  return selection && selection.type === SelectionType.Trigger;
}
