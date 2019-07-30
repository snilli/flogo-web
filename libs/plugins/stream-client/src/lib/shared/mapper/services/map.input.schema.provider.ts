// import { ISchemaProvider } from '../../../common/models/mapper/map-model';
// import { Injectable } from '@angular/core';
// import { IAppModel } from '../../../common/models/app/app.model';
// import { IFlowDiagramTask } from '../../../common/models/app/task.model';
// import { IFlow } from '../../../common/models/app/flows';
// import { TASK_TYPE } from '../../../common/constants';
// import * as schema from 'generate-schema';
// import { ContributionHelper } from '../../../common/util/contributionHelper';
//
// // tslint:disable-next-line:interface-over-type-literal
// type STRING_MAP<T> = {[key: string]: T};
//
// @Injectable()
// export class ContextInputSchemaProvider implements ISchemaProvider {
//   private app: IAppModel;
//   private flow: IFlow;
//   private node: any;
//   private task: IFlowDiagramTask;
//   inputSchema: any;
//
//   getSchema(contextData: STRING_MAP<IAppModel | IFlow | any>): any {
//     this.inputSchema = {
//       type: 'object',
//       title: 'Inputs',
//       properties: {},
//       required: []
//     };
//     this.app = contextData['app'];
//     // Activity or Trigger or Branch of this flow
//     this.flow = contextData['flow'];
//     // This is the node for which we need to get the ScopedInputSchemaProvider
//     this.node = contextData['node'];
//     this.getItemFromNode(this.node);
//     return this.inputSchema;
//   }
//
//   getItemFromNode(node) {
//     this.task = this.flow.items[node.taskID];
//     if (!this.task) {
//       // tslint:disable-next-line:forin
//       for (const handler in this.flow.errorHandler) {
//         this.task = this.flow.errorHandler[handler].items[node.taskID];
//         if (this.task) {
//           break;
//         }
//       }
//     }
//     if (this.task.taskType === TASK_TYPE.TASK_BRANCH) {
//       // This is a branch now I need to return the condition and boolean
//       this.inputSchema.required.push('condition');
//       this.inputSchema.properties['condition'] = {
//         'type': 'boolean'
//       };
//     } else {
//       this.inputSchema.properties = this.getInputSchema();
//     }
//   }
//
//   private getInputSchema(): any {
//     const items = {};
//     const inputs = this.task.inputs;
//     for (const input of inputs) {
//       if (!input.display || (input.display.visible !== false && input.display.mappable === true)) {
//         if (input.required === true) {
//           this.inputSchema.required.push(input.name);
//         }
//         if (input.type === 'string' || input.type === 'number' || input.type === 'boolean' || input.type === 'integer') {
//           const schema = { type: '', required: false };
//           schema.type = input.type;
//           items[input.name] = schema;
//
//         } else if (input.type === 'complex_object') {
//           // If text editor
//           if ((!input.display) || input.display.type === 'texteditor') {
//             if (input.value && input.value.value) {
//               if (this.isJson(input.value.value)) {
//                 try {
//                   // This is a Json convert to schema
//                   items[input.name] = schema.json(JSON.parse(input.value.value));
//                 } catch (e) {
//                   // Handle Inappropriate JSON structure
//                 }
//               } else {
//                 try {
//                   // This is a schema no need of any changes
//                   items[input.name] = JSON.parse(input.value.value);
//                 } catch (e) {
//                   // Handle Inappropriate JSON structure
//                 }
//               }
//             }
//           } else if (input.display.type.toLowerCase() === 'params') {
//             if (input.value && input.value.value) {
//               try {
//                 // This is a schema no need of any changes
//                 const json = JSON.parse(input.value.value);
//                 items[input.name] = JSON.parse(ContributionHelper.jsonToSchema(json));
//               } catch (e) {
//                 // Handle Inappropriate JSON structure
//               }
//             }
//           }
//         }
//       }
//     }
//     return items;
//   }
//
//   private isJson(value) {
//     try {
//       value = JSON.parse(value);
//     } catch (e) {
//       // Handle the inappropriate JSON
//       value = {};
//     }
//     if (!(value.type && (value.properties || value.items))) {
//       return true;
//     }
//     return false;
//   }
// }
