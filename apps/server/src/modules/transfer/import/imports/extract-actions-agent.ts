import { FlogoAppModel } from '@flogo-web/core';
import { ImportsActionAgent } from '@flogo-web/lib-server/core';

type ApplicationAction = FlogoAppModel.Action;

export class ExtractActionsAgent implements ImportsActionAgent {
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
