import { Component, OnInit } from '@angular/core';
import { ModalControl, ModalService } from '@flogo-web/lib-client/modal';
import { FlogoInstallerComponent } from '@flogo-web/lib-client/contrib-installer';
import {
  TriggersService,
  Trigger,
  ContributionsService,
  FLOGO_CONTRIB_TYPE,
} from '@flogo-web/lib-client/core';
import { TriggerSchema } from '@flogo-web/core';
export interface TriggerMetaData {
  appId: string;
}

export interface TriggerSelectorResult {
  installType: 'existing' | 'installed';
  triggerSchema: TriggerSchema;
  trigger?: Trigger;
}

@Component({
  selector: 'flogo-trigger-selector',
  templateUrl: './trigger-selector.component.html',
  styleUrls: ['./trigger-selector.component.less'],
})
export class TriggerSelectorComponent implements OnInit {
  showExistingTriggers = true;
  showExistingTriggersTab = true;
  existingTriggerData: any;
  existingTriggers: Trigger[] = [];
  installedTriggers: TriggerSchema[] = [];
  appId: string;

  constructor(
    private control: ModalControl<TriggerMetaData>,
    private modalService: ModalService,
    private triggerService: TriggersService,
    private contribService: ContributionsService
  ) {
    this.appId = this.control.data.appId;
  }

  ngOnInit() {
    this.getInstalledTriggers();
    this.getExistingTriggers();
  }

  displayExistingTriggers() {
    this.showExistingTriggers = true;
  }

  displayInstalledTriggers() {
    this.showExistingTriggers = false;
  }

  addExistingTriggerToApp(trigger, installType) {
    const triggerSchema = this.installedTriggers.find(schema => {
      return schema.ref === trigger.ref;
    });
    this.control.close({
      triggerSchema,
      installType,
      trigger,
    });
  }

  addNewTriggerToApp(triggerSchema, installType) {
    this.control.close({ triggerSchema, installType });
  }

  closeTriggerSelector() {
    this.control.close(null);
  }

  openInstallTriggerWindow() {
    this.modalService
      .openModal<void>(FlogoInstallerComponent)
      .result.subscribe(status => {
        if (status === 'success') {
          this.showExistingTriggers = false;
          this.ngOnInit();
        }
      });
  }

  private getInstalledTriggers() {
    this.contribService.listContribs(FLOGO_CONTRIB_TYPE.TRIGGER).then(triggers => {
      this.installedTriggers = triggers as TriggerSchema[];
    });
  }

  private getExistingTriggers() {
    this.triggerService.listTriggersForApp(this.appId).then(triggers => {
      this.existingTriggers = triggers;
      if (!this.existingTriggers.length) {
        this.showExistingTriggersTab = false;
        this.showExistingTriggers = false;
      }
    });
  }
}
