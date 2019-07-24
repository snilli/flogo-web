import { pick, fromPairs, isArray } from 'lodash';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  HandlersService,
  SingleEmissionSubject,
  TriggersService,
  RenderableTrigger,
} from '@flogo-web/lib-client/core';
import { select, Store } from '@ngrx/store';
import {
  StreamStoreState as AppState,
  TriggerActions,
  TRIGGER_MENU_OPERATION,
} from '../core';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { getTriggersState } from '../core/state/triggers/triggers.selectors';
import { FlogoInstallerComponent } from '@flogo-web/lib-client/contrib-installer';
import { ModalService } from '@flogo-web/lib-client/modal';
import {
  ConfirmationModalService,
  ConfirmationResult,
} from '@flogo-web/lib-client/confirmation';
import { LanguageService } from '@flogo-web/lib-client/language';
import { TriggerMenuSelectionEvent } from './trigger-block/models';

function settingsToObject(
  settings: { name: string; value?: any }[],
  getValue: (s: { value?: any }) => any = s => s.value
) {
  return isArray(settings) ? fromPairs(settings.map(s => [s.name, getValue(s)])) : {};
}

@Component({
  selector: 'flogo-stream-triggers',
  templateUrl: 'triggers.component.html',
  styleUrls: ['triggers.component.less'],
})
export class FlogoStreamTriggersPanelComponent implements OnInit, OnDestroy {
  appId: string;
  actionId: string;
  triggersList: RenderableTrigger[] = [];
  /* streams-plugin-todo: enable it */
  //currentTrigger: RenderableTrigger;
  showAddTrigger = false;
  private ngDestroy$ = SingleEmissionSubject.create();
  constructor(
    private store: Store<AppState>,
    private modalService: ModalService,
    private restAPITriggersService: TriggersService,
    private _restAPIHandlerService: HandlersService,
    private confirmationService: ConfirmationModalService,
    private translate: LanguageService
  ) {}

  ngOnInit() {
    this.store
      .pipe(
        select(getTriggersState),
        takeUntil(this.ngDestroy$)
      )
      .subscribe(triggerState => {
        this.triggersList = triggerState.triggers;
        this.actionId = triggerState.actionId;
        //this.currentTrigger = triggerState.currentTrigger;
        this.appId = triggerState.appId;
      });
  }

  ngOnDestroy() {
    this.ngDestroy$.emitAndComplete();
  }

  trackTriggerBy(index: number, trigger: RenderableTrigger) {
    return trigger.id;
  }

  openInstallTriggerWindow() {
    this.modalService.openModal<void>(FlogoInstallerComponent).result.subscribe(() => {
      this.openAddTriggerModal();
    });
    this.closeAddTriggerModal(false);
  }

  openAddTriggerModal() {
    this.showAddTrigger = true;
  }

  closeAddTriggerModal(showAddTrigger: boolean) {
    this.showAddTrigger = showAddTrigger;
  }

  addTriggerToAction(data) {
    const settings = settingsToObject(data.triggerData.handler.settings);
    const outputs = settingsToObject(data.triggerData.outputs);
    this.persistNewTriggerAndHandler(data, settings, outputs)
      .then(triggerId => this.restAPITriggersService.getTrigger(triggerId))
      .then(trigger => {
        const handler = trigger.handlers.find(h => h.actionId === this.actionId);
        this.store.dispatch(new TriggerActions.AddTrigger({ trigger, handler }));
      });
  }

  private persistNewTriggerAndHandler(data, settings, outputs) {
    let registerTrigger;
    if (data.installType === 'installed') {
      const appId = this.appId;
      const triggerInfo: any = pick(data.triggerData, ['name', 'ref', 'description']);
      triggerInfo.settings = settingsToObject(data.triggerData.settings, _ => null);
      registerTrigger = this.restAPITriggersService
        .createTrigger(appId, triggerInfo)
        .then(triggerResult => triggerResult.id);
    } else {
      registerTrigger = Promise.resolve(data.triggerData.id);
    }
    return registerTrigger.then(triggerId => {
      return this._restAPIHandlerService
        .updateHandler(triggerId, this.actionId, { settings, outputs })
        .then(() => triggerId);
    });
  }

  private deleteHandlerForTrigger(triggerId) {
    const titleKey = 'PLUGIN-FLOW:TRIGGERS:DELETE-CONFIRMATION-TITLE';
    const messageKey = 'PLUGIN-FLOW:TRIGGERS:DELETE-CONFIRMATION-MESSAGE';
    this.translate
      .get([titleKey, messageKey])
      .pipe(
        switchMap(translation => {
          return this.confirmationService.openModal({
            title: translation[titleKey],
            textMessage: translation[messageKey],
          }).result;
        }),
        filter(result => result === ConfirmationResult.Confirm),
        switchMap(() =>
          this._restAPIHandlerService.deleteHandler(this.actionId, triggerId)
        )
      )
      .subscribe(() => {
        this.store.dispatch(new TriggerActions.RemoveHandler(triggerId));
      });
  }

  private openTriggerMapper(trigger) {
    /* streams-plugin-todo: open trigger configuration */
  }

  handleMenuSelection(event: TriggerMenuSelectionEvent) {
    switch (event.operation) {
      case TRIGGER_MENU_OPERATION.SHOW_SETTINGS:
        this.openTriggerMapper(event.trigger);
        break;
      case TRIGGER_MENU_OPERATION.DELETE:
        this.deleteHandlerForTrigger(event.trigger.id);
        break;
      default:
        console.warn(`[TRIGGER MENU][${event.operation}] unhandled menu action.`);
        break;
    }
  }
}
