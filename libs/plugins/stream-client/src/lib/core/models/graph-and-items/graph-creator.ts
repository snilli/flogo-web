import {
  FlowGraph as StreamGraph,
  GraphNode,
  NodeType,
} from '@flogo-web/lib-client/core';

/* streams-plugin-todo: Add the streams backend interface */
export function makeGraphNodes(stages: any[]): StreamGraph {
  const [rootStage] = stages;
  const nodes = stages.reduce((graphNodes, stage, index, allStages) => {
    const node = makeBasicNode(stage);
    if (index > 0) {
      node.parents = [allStages[index - 1].id];
    }
    if (allStages[index + 1]) {
      node.children = [allStages[index + 1].id];
    }
    graphNodes[node.id] = {
      ...node,
      children: node.children || [],
      parents: node.parents || [],
    };
    return graphNodes;
  }, {});
  return {
    rootId: rootStage ? rootStage.id : null,
    nodes,
  };
}

function makeBasicNode(stage): Partial<GraphNode> {
  return Object.assign(
    {},
    {
      type: NodeType.Task,
      id: stage.id,
      title: stage.name,
      description: stage.description,
      features: {
        selectable: true,
        deletable: true,
        canHaveChildren: true,
        canBranch: false,
      },
    }
  );
}
