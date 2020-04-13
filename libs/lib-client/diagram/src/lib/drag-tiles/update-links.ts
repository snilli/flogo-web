import { DiagramGraph, GraphNodeDictionary, NodeType } from '@flogo-web/lib-client/core';

const taskIdFinder = (nodes: GraphNodeDictionary) => {
  return (id: string) => nodes && nodes[id] && nodes[id].type === NodeType.Task;
};

/*
  Case 1. If root element is moved to different place. It will not have a previous parent and it will have previous child.
          It will have a new parent and may have new child
  Case 2. If an element is moved as root. It will have parent, it will have child.
          It will not have a new parent and will have a child
  Case 3. If an element is moved to last element of a row. It will have parent, it may have child.
          It will have a new parent in the branch id and it will not have a new child
  Case 4. And a normal movement from normal place to another normal place
 */

export function updateLinks(
  currentGraph: DiagramGraph,
  movingItemId: string,
  newParentId: string
) {
  const graph = { ...currentGraph };
  const findTaskId = taskIdFinder(graph.nodes);
  const allNodes = graph.nodes;
  const nodeToMove = allNodes[movingItemId];
  const prevParentId = nodeToMove.parents.pop();
  const prevChildId = nodeToMove.children.find(findTaskId);
  const newParentNode = newParentId && allNodes[newParentId];
  const newChildId = newParentNode
    ? newParentNode.children.find(findTaskId)
    : graph.rootId;

  nodeToMove.children = replaceNodeIds(nodeToMove.children, prevChildId, newChildId);
  if (newParentId) {
    nodeToMove.parents.push(newParentId);
    newParentNode.children = replaceNodeIds(
      newParentNode.children,
      newChildId,
      movingItemId
    );
  } else {
    graph.rootId = nodeToMove.id;
  }

  if (prevParentId) {
    const prevParentNode = prevParentId && allNodes[prevParentId];
    prevParentNode.children = replaceNodeIds(
      prevParentNode.children,
      movingItemId,
      prevChildId
    );
  } else {
    /* In case where we are moving the root item, then moved item's non branch child becomes root.
     * Here there will be a previous child as a root element without children cannot be moved to root*/
    graph.rootId = prevChildId;
  }

  if (prevChildId) {
    const prevChildNode = prevChildId && allNodes[prevChildId];
    prevChildNode.parents = replaceNodeIds(
      prevChildNode.parents,
      movingItemId,
      prevParentId
    );
  }

  if (newChildId) {
    const newChildNode = newChildId && allNodes[newChildId];
    newChildNode.parents = replaceNodeIds(
      newChildNode.parents,
      newParentId,
      movingItemId
    );
  }

  return graph;
}

/****
 * This function handles the logic to remove a previous node Id and add a new node Id to the array.
 *
 * @param inArray {Array} String array which holds all the children of the tile
 * @param replaceId {string | undefined} Id to be removed from the array
 * @param withId {string | undefined} Id to be added as the first element to the array
 */
function replaceNodeIds(inArray: string[], replaceId: string, withId: string) {
  const idx = inArray.indexOf(replaceId);
  if (replaceId && idx > -1) {
    inArray.splice(idx, 1);
  }
  if (withId) {
    inArray.unshift(withId);
  }
  return inArray;
}
