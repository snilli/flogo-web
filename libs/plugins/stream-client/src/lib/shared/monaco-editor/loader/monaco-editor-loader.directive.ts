import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { MonacoEditorLoaderService } from './monaco-editor-loader.service';

// from https://github.com/leolorenzoluis/xyz.MonacoEditorLoader
// not using library directly as it is incompatible with angular 2.x
// tslint:disable-next-line:directive-selector
@Directive({ selector: '[loadMonacoEditor]' })
export class MonacoEditorLoaderDirective {
  @Input()
  set loadMonacoEditor(value) {
    this.monacoEditorLoaderService.monacoPath = value;
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private monacoEditorLoaderService: MonacoEditorLoaderService
  ) {
    monacoEditorLoaderService.isMonacoLoaded.subscribe(isLoaded => {
      if (isLoaded) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }
}
