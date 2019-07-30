// import { IFlowDiagramTask } from "../../../common/models/app/task.model";
// import { IFlow } from "../../../common/models/app/flows";
// import { IAppModel } from "../../../common/models/app/app.model";
// import { ISchemaProvider } from "../../../common/models/mapper/map-model";
// import { Injectable } from "@angular/core";
// import { STRING_MAP } from "../../../common/types";
// import * as schema from "generate-schema";
// import * as lodash from "lodash";
// import { TASK_TYPE } from "../../../common/constants";
// import { ContributionHelper } from "../../../common/util/contributionHelper";
// // tslint:disable:forin
// @Injectable()
// export class ScopedOutputSchemaProvider implements ISchemaProvider {
//   private app: IAppModel;
//   private flow: IFlow;
//   private node: any;
//   private task: any;
//   outputSchema: any;
//   getSchema(contextData: STRING_MAP<IAppModel | IFlow | any>): any {
//     this.outputSchema = {
//       type: "object",
//       title: "Outputs",
//       properties: {}
//     };
//     this.app = contextData["app"];
//     // Activity or Trigger or Branch of this flow
//     this.flow = contextData["flow"];
//     // This is the node for which we need to get the ScopedOutputSchemaProvider
//     this.node = contextData["node"];
//     this.traverseParentNodes(this.node);
//     return this.outputSchema;
//   }
//
//   traverseParentNodes(node) {
//     for (let i = 0; i < node.parents.length; i++) {
//       let parentNode = this.flow.paths.nodes[node.parents[i]];
//       if (!parentNode) {
//         for (let handler in this.flow.errorHandler) {
//           parentNode = this.flow.errorHandler[handler].paths.nodes[node.parents[i]];
//           if (parentNode) {
//             break;
//           }
//         }
//       }
//       let parentNodeTaskId = parentNode.taskID;
//       if (parentNodeTaskId) {
//         this.task = this.getParentItem(parentNodeTaskId);
//         let schema = {
//           type: "object",
//           title: this.task.title,
//           properties: {}
//         };
//         schema.properties = this.getOutputsSchema();
//         if (!(lodash.isEmpty(schema.properties))) {
//           if (this.task.taskType === TASK_TYPE.TASK_ROOT) {
//             if (this.task.name === "flogo-wi-error") {
//               this.outputSchema.properties["$Error"] = schema;
//             } else {
//               this.outputSchema.properties["$TriggerData"] = schema;
//             }
//           } else {
//             this.outputSchema.properties["$" + this.task.title] = schema;
//           }
//         }
//         this.traverseParentNodes(parentNode);
//       }
//     }
//   }
//
//   private getParentItem(id: string): IFlowDiagramTask {
//     let item = this.flow.items[id];
//     if (!item) {
//       for (let handler in this.flow.errorHandler) {
//         item = this.flow.errorHandler[handler].items[id];
//         if (item) {
//           break;
//         }
//       }
//     }
//     return item;
//   }
//
//   private getOutputsSchema(): any {
//     let items = {};
//     let outputs = this.task.outputs;
//     if (outputs) {
//       for (let output of outputs) {
//         if (!output.display || output.display.visible !== false) {
//           if (output.type === "string" || output.type === "number" || output.type === "boolean" || output.type === "integer") {
//             let schema = { type: "", required: false };
//             schema.type = output.type;
//             items[output.name] = schema;
//
//           } else if (output.type === "complex_object") {
//             // If text editor
//             if ((!output.display) || output.display.type === "texteditor") {
//               if (output.value && output.value.value) {
//                 if (this.isJson(output.value.value)) {
//                   try {
//                     // This is a Json convert to schema
//                     items[output.name] = schema.json(JSON.parse(output.value.value));
//                   } catch (e) {
//                     // Handle Inappropriate JSON structure
//                   }
//                 } else {
//                   try {
//                     // This is a schema no need of any changes
//                     items[output.name] = JSON.parse(output.value.value);
//                   } catch (e) {
//                     // Handle Inappropriate JSON structure
//                   }
//                 }
//               }
//             } else if (output.display.type.toLowerCase() === "params") {
//               if (output.value && output.value.value) {
//                 try {
//                   // This is a schema no need of any changes
//                   let json = JSON.parse(output.value.value);
//                   items[output.name] = JSON.parse(ContributionHelper.jsonToSchema(json));
//                 } catch (e) {
//                   // Handle Inappropriate JSON structure
//                 }
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
