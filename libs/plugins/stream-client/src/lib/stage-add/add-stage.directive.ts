import { isEqual } from 'lodash';
import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';

import {
  DiagramSelection,
  DiagramSelectionType,
  BUTTON_INSERT_CLASS,
  SELECTED_INSERT_TILE_CLASS,
} from '@flogo-web/lib-client/diagram';

import { AddActivityService } from './add-activity.service';

const BRANCH_ANIMATION_DURATION = 300;

@Directive({
  selector: '[fgAddStage]',
})
export class AddStageDirective implements OnInit, OnChanges, OnDestroy {
  @Input()
  selection: DiagramSelection;

  constructor(private el: ElementRef, private addStageService: AddActivityService) {}

  ngOnInit() {
    this.addStageService.startSubscriptions();
  }

  ngOnChanges({ selection }: SimpleChanges) {
    if (selection && !selection.firstChange) {
      const currentSelection = selection.currentValue;
      const previousSelection = selection.previousValue;
      /*************
       * The popover is closed under the following conditions:
       *    1. If there is no currentSelection (when clicked outside)
       *    2. If the current selection is not of type Insert
       *    3. If the current selection and the previous selection are of Insert type and with the same parent taskId
       */
      if (
        !currentSelection ||
        currentSelection.type !== DiagramSelectionType.Insert ||
        isEqual(currentSelection, previousSelection)
      ) {
        setTimeout(() => {
          this.addStageService.close();
        }, 0);
      } else {
        setTimeout(() => {
          const selectedInsertTile = this.el.nativeElement.querySelector(
            `.${SELECTED_INSERT_TILE_CLASS} .${BUTTON_INSERT_CLASS}`
          );
          this.addStageService.open(selectedInsertTile, currentSelection.taskId);
        }, BRANCH_ANIMATION_DURATION);
      }
    }
  }

  ngOnDestroy() {
    this.addStageService.closeAndDestroy();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const popoverRef = this.addStageService.popoverReference;
    const keepActive = this.addStageService.shouldKeepPopoverActive;
    if (!keepActive && popoverRef && popoverRef.hasAttached()) {
      const clickTarget = <HTMLElement>event.target;
      const overlayHost = popoverRef.hostElement;
      if (clickTarget !== overlayHost && !overlayHost.contains(clickTarget)) {
        this.addStageService.cancel();
      }
    }
  }
}
