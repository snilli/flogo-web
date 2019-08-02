import { Dictionary } from '../common';
import { GraphNode } from './node';

export type NodeDictionary = Dictionary<GraphNode>;

export interface DiagramGraph {
  rootId: string;
  nodes: NodeDictionary;
}

export { DiagramGraph as FlowGraph };
