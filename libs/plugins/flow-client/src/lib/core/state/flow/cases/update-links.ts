import { DiagramGraph } from '@flogo-web/lib-client/core';

import { FlowState } from '../flow.state';
import { getGraphName } from '../../utils';
import { BRANCH_PREFIX } from '../../../constants';

const getNonBranchId = (id: string) => !id.startsWith(BRANCH_PREFIX);

export function updateLinksOnMove(state: FlowState, { handlerType, itemId, parentId }) {
  /*
  Case 1. If root element is moved to different place. It will not have a previous parent and it will have previous child.
          It will have a new parent and may have new child
  Case 2. If an element is moved as root. It will have parent, it will have child.
          It will not have a new parent and will have a child
  Case 3. If an element is moved to last element of a row. It will have parent, it may have child.
          It will have a new parent in the branch id and it will not have a new child
  Case 4. And a normal movement from normal place to another normal place
   */
  const currentGraphName: string = getGraphName(handlerType);
  const graph: DiagramGraph = { ...state[currentGraphName] };
  const allNodes = graph.nodes;
  const nodeToMove = allNodes[itemId];
  const prevParentId = nodeToMove.parents.pop();
  const prevChildId = nodeToMove.children.find(getNonBranchId);
  const newParentNode = parentId && allNodes[parentId];
  const newChildId = newParentNode
    ? newParentNode.children.find(getNonBranchId)
    : graph.rootId;

  nodeToMove.children = replaceNodeIds(nodeToMove.children, prevChildId, newChildId);
  if (parentId) {
    nodeToMove.parents.push(parentId);
    newParentNode.children = replaceNodeIds(newParentNode.children, newChildId, itemId);
  } else {
    graph.rootId = nodeToMove.id;
  }

  if (prevParentId) {
    const prevParentNode = prevParentId && allNodes[prevParentId];
    prevParentNode.children = replaceNodeIds(
      prevParentNode.children,
      itemId,
      prevChildId
    );
  } else {
    /* In case where we are moving the root item, then moved item's non branch child becomes root.
     * Here there will be a previous child as a root element without children cannot be moved to root*/
    graph.rootId = prevChildId;
  }

  if (prevChildId) {
    const prevChildNode = prevChildId && allNodes[prevChildId];
    prevChildNode.parents = replaceNodeIds(prevChildNode.parents, itemId, prevParentId);
  }

  if (newChildId) {
    const newChildNode = newChildId && allNodes[newChildId];
    newChildNode.parents = replaceNodeIds(newChildNode.parents, parentId, itemId);
  }

  return {
    ...state,
    [currentGraphName]: graph,
  };
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
