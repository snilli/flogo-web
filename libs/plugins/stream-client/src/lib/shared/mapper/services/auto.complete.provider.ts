// import { Observable } from 'rxjs/Observable';
// import { TreeNodeFactoryService } from './tree-node-factory.service';
// import { MapperContext, IMappingFunction } from './../../../common/models/mapper/map-model';
// import { Injectable } from '@angular/core';
// // import { STRING_MAP } from '../../../common/types';
// // import { IAppModel } from '../../../common/models/app/app.model';
// // import { IFlow } from '../../../common/models/app/flows';
//
// @Injectable()
// export class AutoCompleteProvider {
//
//   constructor(private nodeFactory: TreeNodeFactoryService) {
//     //
//   }
//
//   getRecommendations(context: MapperContext, editorContent: string, offset: number): Observable<any> {
//     // return Observable.create(observer => {
//     //   lconst_observer = observer, recommendations = [];
//     //   lconstoutputSchema = this.getOutputSchema(context);
//     //   lconstfunctions = this.getFunctionsData(context);
//     //   Observable.merge(
//     //     outputSchema,
//     //     functions
//     //   )
//     //     .map(result => {
//     //       return result;
//     //     })
//     //     .filter(res => res)
//     //     .toArray()
//     //     .subscribe(data => {
//     //       observer.next(data);
//     //     });
//     // });
//     // Get the parse tree for the given expression
//     // Check if editorContent is empty then return everything
//     // else call parse tree
//
//     // Get the output schema for previous nodes
//
//     // Get the list of functions
//
//     // Merge those two and based on cursor position give the recommendations
//   }
//
//   getOutputSchema(context: MapperContext): Observable<any> {
//     // return Observable.create(observer => {
//     //   lconstoutputSchema = context.getScopedOutputSchemaProvider().getSchema(<any>context.getContextData());
//     //   observer.next(outputSchema);
//     //   observer.complete();
//     // });
//   }
//
//   getFunctionsData(context: MapperContext): Observable<STRING_MAP<IMappingFunction>> {
//     return context.getMapFunctionsProvider().getFunctions();
//   }
// }
