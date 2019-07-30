// import * as lodash from 'lodash';
//
// import {
//   ArgumentNode,
//   CallExpressionNode,
//   ExpressionStatementNode,
//   IdentifierNode,
//   LiteralNode,
//   MemberExpressionNode,
//   NodeVisitor,
//   ProgramNode
// } from '../expr-visitor';
// import { MemberAccess } from './member-access';
// import { IReferenceCollector } from './reference-collector';
// import { ValidatorReporter } from './validator-reporter';
// import { ErrorFactory } from './errors';
// import { IFunctionArgs, IFunctionContribution } from '../../contrib';
//
// export class ValidatorVisitor extends NodeVisitor {
//
//   private types = {
//     EXPRESSION_STATEMENT: 'ExpressionStatement',
//     CALL_EXPRESSION: 'CallExpression',
//     ARGUMENT: 'Argument',
//     MEMBER_EXPRESSION: 'MemberExpression',
//     IDENTIFIER: 'Identifier',
//     LITERAL: 'Literal',
//     ACCESSOR: 'accessor',
//     PROPERTY: 'property',
//   };
//
//   private expressionCount = 0;
//   private contexts = [];
//
//   constructor(private symbolTable: any,
//               private expectedDataTypeResult: { type: string, array?: boolean },
//               private reporter: ValidatorReporter,
//               private collector?: IReferenceCollector) {
//     super();
//   }
//
//   visitEnterProgram(node: ProgramNode) {
//     this.expressionCount = 0;
//   }
//
//   visitLeaveProgram(node: ProgramNode) {
//     if (this.expressionCount > 1) {
//       this.reporter.report(
//         ErrorFactory.UnexpectedExpressionCount(node.getLocation())
//       );
//     }
//     // todo: compare expression output is compatible with left hand side of assignment
//   }
//
//   visitEnterExpressionStatement(node: ExpressionStatementNode) {
//     this.expressionCount += 1;
//     this.addContext({ type: this.types.EXPRESSION_STATEMENT });
//   }
//
//   visitLeaveExpressionStatement(node: ExpressionStatementNode) {
//     const context = this.removeContext();
//
//     if (context.dataTypeResult && this.expectedDataTypeResult && !this.isTypeMatch(
//            this.expectedDataTypeResult, context.dataTypeResult
//      )) {
//       let actualType = context.dataTypeResult.valueType || 'unknown';
//       if (actualType === 'array') {
//         actualType = `${context.dataTypeResult.memberType}[]`;
//       }
//       const expectedType = this.expectedDataTypeResult.array ?
//                                  `${this.expectedDataTypeResult.type}[]`
//                                   : this.expectedDataTypeResult.type;
//       this.reporter.report(ErrorFactory.InvalidExpressionResult(context.location,
//         { actual: actualType, expected: expectedType }, context));
//     }
//   }
//
//   visitEnterCallExpression(node: CallExpressionNode) {
//     const context: any = this.addContext({ type: this.types.CALL_EXPRESSION });
//     context.location = node.getLocation();
//     context.path = [];
//     context.arguments = [];
//   }
//
//   visitLeaveCallExpression(node: CallExpressionNode) {
//     const context = this.removeContext();
//     const parentContext = this.getCurrentContext();
//     const isFunctionArgument = parentContext && parentContext.type === this.types.ARGUMENT;
//     if (isFunctionArgument) {
//       parentContext.argument = context;
//     }
//
//     if (lodash.isEmpty(context.path)) {
//       return;
//     }
//
//     this.collectFunctionReference(context.path);
//     const descriptor = this.findInSymbolTable(context.path);
//     if (descriptor && descriptor.type === 'function') {
//       const funcDescriptor = <IFunctionContribution> descriptor;
//       if (funcDescriptor.args) {
//         this.validateFunctionArguments(funcDescriptor, context);
//       }
//       if (isFunctionArgument) {
//         parentContext.argument.valueType = funcDescriptor.return.type;
//         if (funcDescriptor.return.array) {
//           parentContext.argument.valueType = 'array';
//           parentContext.argument.memberType = funcDescriptor.return.type;
//         }
//         parentContext.argument.valueType = funcDescriptor.return.type;
//       }
//
//       if (parentContext.type === this.types.EXPRESSION_STATEMENT) {
//         parentContext.dataTypeResult = {
//           valueType: (funcDescriptor.return && funcDescriptor.return.array) ? 'array' : funcDescriptor.return.type,
//           memberType: funcDescriptor.return.type
//         };
//         parentContext.location = context.location;
//       }
//
//     } else if (descriptor && descriptor.type !== 'function') {
//       const lastPathPart = context.path[context.path.length - 1];
//       this.reporter.report(ErrorFactory.IllegalCallExpression(lastPathPart.location, { calleeName: lastPathPart.name }));
//     } else {
//       // if no func descriptor means member expression was invalid so errors should've been already reported and
//       // no further action is required
//     }
//
//   }
//
//   visitEnterArgument(node: ArgumentNode) {
//     const context = this.addContext({ type: this.types.ARGUMENT });
//   }
//
//   visitLeaveArgument(node: ArgumentNode) {
//     const argContext = this.removeContext();
//     // validate return type in context?
//     const callerContext = this.getCurrentContext();
//     callerContext.arguments.push(argContext.argument);
//   }
//
//   visitEnterMemberExpression(node: MemberExpressionNode) {
//     const context = this.addContext({ type: this.types.MEMBER_EXPRESSION });
//     context.location = node.getLocation();
//   }
//
//   visitLeaveMemberExpression(node: MemberExpressionNode) {
//     const context = this.removeContext();
//     const parentContext = this.getCurrentContext();
//
//     let isValidPath;
//     this.accumulateInPath(...context.path);
//     if (parentContext.type !== this.types.MEMBER_EXPRESSION) {
//       isValidPath = this.validatePath(context.path);
//       if (parentContext.type !== this.types.CALL_EXPRESSION) {
//         this.collectMemberReference(context.path);
//       }
//     }
//
//     if (parentContext.type === this.types.ARGUMENT) {
//       parentContext.argument = context;
//       if (isValidPath) {
//         const paramDescriptor = this.findInSymbolTable(context.path);
//         parentContext.argument.valueType = paramDescriptor.type;
//         parentContext.argument.memberType = paramDescriptor.memberType;
//       } else {
//         parentContext.argument.valueType = null;
//       }
//     } else if (parentContext && parentContext.type === this.types.CALL_EXPRESSION) {
//       // parentContext.path = isValidPath ? context.path : null;
//       parentContext.path = context.path;
//       parentContext.location = parentContext.location || context.location;
//     } else if (parentContext && parentContext.type === this.types.EXPRESSION_STATEMENT) {
//       if (isValidPath) {
//         const paramDescriptor = this.findInSymbolTable(context.path);
//         parentContext.dataTypeResult = {
//           valueType: paramDescriptor.type || paramDescriptor.memberType,
//           memberType: paramDescriptor.memberType || paramDescriptor.type
//         };
//         parentContext.location = parentContext.location || context.location;
//       }
//     }
//
//   }
//
//   visitEnterIdentifier(node: IdentifierNode) {
//     this.accumulateInPath({ type: 'property', name: node.getName(), location: node.getLocation() });
//   }
//
//   visitLeaveIdentifier(node: IdentifierNode) {
//     const parentContext = this.getCurrentContext();
//     if (parentContext.type === this.types.MEMBER_EXPRESSION) {
//       return;
//     }
//
//     const isValidPath = this.validatePath(parentContext.path);
//
//     if (parentContext.type === this.types.ARGUMENT) {
//       if (isValidPath) {
//         const paramDescriptor = this.findInSymbolTable(parentContext.path);
//         parentContext.argument = {
//           type: this.types.MEMBER_EXPRESSION,
//           valueType: paramDescriptor.type,
//           memberType: paramDescriptor.memberType
//         };
//       } else {
//         parentContext.argument = {
//           type: null,
//           valueType: null,
//           location: node.getLocation()
//         };
//       }
//     }
//   }
//
//   visitEnterLiteral(node: LiteralNode) {
//     // if (this.getCurrentContext().type === this.types.MEMBER_EXPRESSION) {
//     //   this.accumulateInPath({ type: "accessor", name: node.getName(), location: node.getLocation() });
//     // }
//   }
//
//   visitLeaveLiteral(node: LiteralNode) {
//     const currentContext = this.getCurrentContext();
//     const literalType = this.determineLiteralType(node.getValue());
//     if (currentContext.type === this.types.MEMBER_EXPRESSION) {
//       this.accumulateInPath({ type: 'accessor', name: node.getName(), location: node.getLocation() });
//     } else if (currentContext.type === this.types.ARGUMENT) {
//       currentContext.argument = {
//         type: this.types.LITERAL,
//         valueType: literalType
//       };
//     } else if (currentContext.type === this.types.EXPRESSION_STATEMENT) {
//       currentContext.dataTypeResult = { valueType: literalType };
//       currentContext.location = node.getLocation() || currentContext.location;
//     }
//   }
//
//   private collectFunctionReference(funcPath: MemberAccess[]) {
//     if (this.collector) {
//       this.collector.addFunctionReference(funcPath);
//     }
//   }
//
//   private collectMemberReference(memberPath: MemberAccess[]) {
//     if (this.collector) {
//       this.collector.addMemberReference(memberPath);
//     }
//   }
//
//   private validatePath(parts: MemberAccess[]) {
//     let node = null;
//     let prevNode;
//     let prevPart: MemberAccess;
//     let part: MemberAccess;
//     // avoiding functional iteration so we are able to break early
//     for (let index = 0; index < parts.length; index++) {
//       part = parts[index];
//       prevNode = node;
//       prevPart = prevNode ? parts[index - 1] : null;
//       if (node) {
//         if (node.children) {
//           node = node.children[part.name];
//         } else {
//           node = null;
//         }
//       } else if (!node) {
//         node = this.symbolTable[part.name];
//       }
//
//       if (prevNode && prevNode.type === 'array' && part.type !== this.types.ACCESSOR) {
//         const location = prevPart.location && part.location ? {
//           start: prevPart.location.start,
//           end: part.location.end
//         } : prevPart.location;
//         this.reporter.report(ErrorFactory.IndexAccessExpected(location));
//         return;
//       }
//
//       if (prevNode && part.type === this.types.ACCESSOR) {
//         if (prevNode.type !== 'array') {
//           this.reporter.report(ErrorFactory.IllegalIndexAccess(part.location, { propName: prevNode.name }));
//           return;
//         }
//       }
//
//       // todo: case access property in array access
//       if (!node && prevNode) {
//         if (part.type === this.types.ACCESSOR) {
//           if (prevNode.type === 'array') {
//             node = {
//               type: prevNode.memberType,
//               children: prevNode.children
//             };
//           } else {
//             this.reporter.report(ErrorFactory.IllegalIndexAccess(part.location, { propName: prevPart.name }));
//           }
//         } else if (!this.isNodeAllowedToHaveSubproperties(prevNode)) {
//           this.reporter.report(ErrorFactory.UnexpectedMemberAccess(part.location, {
//             propName: part.name,
//             parentType: prevNode.type
//           }));
//         } else {
//           this.reporter.report(
//             ErrorFactory.InvalidPropertyReference(part.location, { propName: part.name, parentName: prevPart.name })
//           );
//         }
//       } else if (!node && !prevNode) {
//         this.reporter.report(ErrorFactory.InvalidReference(part.location, { name: part.name }));
//       }
//
//       if (!node) {
//         // cannot continue the chain, stop processing
//         return false;
//       }
//     }
//     return true;
//   }
//
//   private findInSymbolTable(parts: MemberAccess[]) {
//     parts = [...parts];
//     let part = parts.shift();
//     let symbolEntry = this.symbolTable[part.name];
//     if (!symbolEntry) {
//       return null;
//     }
//     const getNextSymbolEntry = forPathPart => forPathPart ? symbolEntry.children[forPathPart.name] : null;
//     while (parts.length > 0) {
//       part = parts.shift();
//       if (part.type === this.types.ACCESSOR) {
//         if (parts.length > 0) {
//           part = parts.shift();
//           symbolEntry = getNextSymbolEntry(part);
//         } else {
//           // node should represent an element of the accessed array
//           symbolEntry = Object.assign({}, symbolEntry, { type: symbolEntry.memberType, memberType: undefined });
//         }
//       } else {
//         symbolEntry = getNextSymbolEntry(part);
//       }
//
//       if (!symbolEntry) {
//         return null;
//       }
//     }
//     return symbolEntry;
//   }
//
//   private determineLiteralType(value: any) {
//     if (lodash.isString(value)) {
//       return 'string';
//     } else if (lodash.isNumber(value)) {
//       return 'number';
//     } else if (lodash.isBoolean(value)) {
//       return 'boolean';
//     } else {
//       return null;
//     }
//   }
//
//   private isNodeAllowedToHaveSubproperties(node) {
//     return node.type === 'function' || node.type === 'object' || node.type === 'namespace';
//   }
//
//   private accumulateInPath(...parts: MemberAccess[]) {
//     const context = this.getCurrentContext();
//     if (context.path) {
//       context.path.push(...parts);
//     } else {
//       context.path = [...parts];
//     }
//   }
//
//   private getCurrentContext(): any {
//     const length = this.contexts.length;
//     if (length) {
//       return this.contexts[length - 1];
//     }
//     return null;
//   }
//
//   private addContext(context: { type: string }): any {
//     this.contexts.push(context);
//     return context;
//   }
//
//   private removeContext() {
//     return this.contexts.pop();
//   }
//
//   private validateFunctionArguments(funcDescriptor: IFunctionContribution, context: any) {
//     const isRequiredArg = (arg: IFunctionArgs) => arg.required === undefined || arg.required;
//     const expectedArgs = funcDescriptor.args || [];
//     const actualArgs = context.arguments || [];
//     const argQueue: IFunctionArgs[] = [...expectedArgs];
//
//     let expectedArg: IFunctionArgs;
//     let minArgCount = 0;
//     let maxArgCount = expectedArgs.length;
//     actualArgs.forEach((actualArg) => {
//       if (!expectedArg) {
//         expectedArg = argQueue.shift();
//         if (!expectedArg) {
//           // no more expectedArgs, ignore
//           return;
//         }
//         if (isRequiredArg(expectedArg)) {
//           minArgCount++;
//         }
//       }
//       const { type, array } = expectedArg;
//       if (actualArg && expectedArg && !this.isTypeMatch({ type, array }, actualArg)) {
//         let actualType = actualArg.valueType || 'unknown';
//         if (actualType === 'array') {
//           actualType = `${actualArg.memberType}[]`;
//         }
//         const expectedType = expectedArg.array ? `${expectedArg.type}[]` : expectedArg.type;
//         this.reporter.report(ErrorFactory.ArgumentTypeMismatch(actualArg.location, {
//           paramName: expectedArg.name,
//           expectedType,
//           actualType
//         }));
//       }
//
//       if (expectedArg.variable) {
//         maxArgCount = -1;
//       } else {
//         expectedArg = null;
//       }
//     });
//
//     if (actualArgs.length < minArgCount) {
//       this.reporter.report(
//         ErrorFactory.MinimumArgumentCountMismatch(
//           this.getLocationForPath(context.path),
//           { actualCount: actualArgs.length, leastExpectedCount: minArgCount }
//         )
//       );
//     }
//
//     const hasMissingRequiredParams = argQueue.length > 0 && argQueue.findIndex(arg => isRequiredArg(arg)) > -1;
//     const hasExtraParams = maxArgCount > -1 && actualArgs.length > maxArgCount;
//     if (hasMissingRequiredParams || hasExtraParams) {
//       this.reporter.report(ErrorFactory.ArgumentCountMismatch(
//         this.getLocationForPath(context.path),
//         { actualCount: actualArgs.length, expectedCount: expectedArgs.length })
//       );
//     }
//   }
//
//   private getLocationForPath(parts: MemberAccess[]) {
//     const start = parts[0];
//     const end = parts[parts.length - 1];
//     return {
//       start: start.location.start,
//       end: end.location.end,
//     };
//   }
//
//
//   private isTypeMatch(expectedArg: { type: string, array?: boolean }, argContext: { valueType: string, memberType: string }) {
//     // todo: warn using any?
//     // todo: support other "compatible" types. Example: integer with integer but not number with integer
//     //    or array with object but object with array
//     const isNumberType = type => type === 'number' || type === 'integer';
//     const isCompatibleType = (expected, actual) => {
//       const isDirectlyCompatible = expected === 'any' || actual === 'any' || expected === actual;
//       if (isDirectlyCompatible) {
//         return true;
//       }
//       if (isNumberType(expected)) {
//         return isNumberType(actual);
//       }
//       return false;
//     };
//
//     if (expectedArg.array) {
//       return argContext.valueType === 'array' && isCompatibleType(expectedArg.type, argContext.memberType);
//     } else {
//       return isCompatibleType(expectedArg.type, argContext.valueType);
//     }
//   }
//
// }
