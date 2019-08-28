import { FlogoAppModel } from '@flogo-web/core';
import { ImportsActionsManager } from '@flogo-web/lib-server/core';

type ApplicationAction = FlogoAppModel.Action;

export class ExtractActions implements ImportsActionsManager {
  private actionIds: Map<string, ApplicationAction>;

  constructor(actions: ApplicationAction[] = []) {
    this.actionIds = new Map(actions.map(action => [action.id, action]));
  }

  getSettingsForId(actionId: string): ApplicationAction['settings'] {
    const actionForId = this.actionIds.get(actionId);
    return actionForId && actionForId.settings;
  }

  getRefForId(actionId: string): string {
    const actionForId = this.actionIds.get(actionId);
    return actionForId && actionForId.ref;
  }
}
