import { NgModule, ModuleWithProviders, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MonacoEditorComponent } from './monaco-editor.component';
import {
  MonacoEditorLoaderService,
  MonacoEditorLoaderDirective,
  factory as loaderFactory,
} from './loader';

@NgModule({
  imports: [CommonModule],
  exports: [MonacoEditorLoaderDirective, MonacoEditorComponent],
  declarations: [MonacoEditorLoaderDirective, MonacoEditorComponent],
})
export class MonacoEditorModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MonacoEditorModule,
      providers: [
        {
          provide: MonacoEditorLoaderService,
          deps: [NgZone],
          useFactory: loaderFactory,
        },
      ],
    };
  }
}
