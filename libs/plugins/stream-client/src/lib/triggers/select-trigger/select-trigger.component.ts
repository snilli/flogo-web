import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  Output,
} from '@angular/core';
import { BsModalComponent } from 'ng2-bs3-modal';
import { TriggersService } from '@flogo-web/lib-client/core';
import { FlogoProfileService } from '../../core';

@Component({
  selector: 'flogo-stream-select-trigger',
  templateUrl: 'select-trigger.component.html',
  styleUrls: ['select-trigger.component.less'],
})
export class FlogoSelectTriggerComponent implements OnInit, OnChanges {
  @ViewChild('addTriggerModal', { static: true }) modal: BsModalComponent;
  @Input() appId: string;
  @Input() isAddTriggerActivated: boolean;
  @Output() addTriggerToAction: EventEmitter<any> = new EventEmitter<any>();
  @Output() installDialog = new EventEmitter();
  @Output() isAddTriggerActivatedChange = new EventEmitter();
  public installedTriggers = [];
  public displayExisting: boolean;

  public existingTriggers = [];
  private _isActivated = false;

  constructor(
    private profileService: FlogoProfileService,
    private triggersApiService: TriggersService
  ) {
    this.displayExisting = true;
  }

  ngOnInit() {}

  onModalCloseOrDismiss() {
    this._isActivated = false;
    this.isAddTriggerActivatedChange.emit(false);
  }

  openModal() {
    this.modal.open();
  }

  closeModal() {
    this.modal.close();
  }

  getExistingTriggers() {
    return this.triggersApiService.listTriggersForApp(this.appId);
  }

  loadInstalledTriggers() {
    return this.profileService
      .getTriggers()
      .then((triggers: any) => {
        this.installedTriggers = triggers;
        return triggers;
      })
      .then(installed => {
        this.getExistingTriggers().then(triggers => {
          if (!triggers.length) {
            this.displayExisting = false;
          } else if (triggers.length > 0) {
            this.displayExisting = true;
          }

          const allInstalled = {};

          installed.forEach(item => {
            allInstalled[item.ref] = Object.assign({}, item);
          });

          this.existingTriggers = [];
          triggers.forEach(existing => {
            const found = Object.assign({}, allInstalled[existing.ref]);
            if (found) {
              found.id = existing.id;
              found.name = existing.name;
              found.description = existing.description;
              this.existingTriggers.push(found);
            }
          });
        });
      })
      .then(() => {
        return this.existingTriggers;
      })
      .catch((err: any) => {
        console.error(err);
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    const change = changes.isAddTriggerActivated;
    if (change) {
      this.onActivatedStatusChange(change.currentValue);
    }
  }

  onActivatedStatusChange(newVal) {
    if (newVal !== this._isActivated) {
      this._isActivated = newVal;
      if (this._isActivated) {
        this.loadInstalledTriggers();
        this.openModal();
      } else {
        this.closeModal();
      }
    }
  }

  sendAddTriggerMsg(trigger: any, installType: string) {
    this.closeModal();
    this.addTriggerToAction.emit({ triggerData: trigger, installType });
  }

  openInstallTriggerDialog() {
    this.installDialog.emit();
  }
}
