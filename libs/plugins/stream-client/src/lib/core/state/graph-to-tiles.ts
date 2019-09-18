import { DiagramGraph } from '@flogo-web/lib-client/core';
import { TaskTile, TileType } from '@flogo-web/lib-client/diagram';

export const graphToTiles = (graph: DiagramGraph, maxTileCount: number) => {
  let currentId = graph.rootId;
  const tiles: TaskTile[] = [];
  while (currentId) {
    const currentStage = graph.nodes[currentId];
    if (
      tiles.length >= maxTileCount - 1 &&
      currentStage &&
      !currentStage.children.length
    ) {
      tiles.push({
        type: TileType.Task,
        task: currentStage,
        isTerminalInRow: true,
      });
    } else if (currentStage) {
      tiles.push({
        type: TileType.Task,
        task: currentStage,
      });
    }
    let nextStageId = null;
    if (currentStage && currentStage.children.length) {
      nextStageId = currentStage.children[0];
    }
    currentId = nextStageId;
  }
  return tiles;
};
