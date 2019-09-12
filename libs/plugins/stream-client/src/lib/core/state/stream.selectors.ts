import { createFeatureSelector, createSelector } from '@ngrx/store';

import { DiagramSelectionType, Tile, TileType } from '@flogo-web/lib-client/diagram';
import { Dictionary, DiagramGraph } from '@flogo-web/lib-client/core';
import {
  ContributionType,
  FunctionsSchema,
  ContributionSchema,
  CONTRIB_REFS,
} from '@flogo-web/core';

import { FlogoStreamState } from './stream.state';
import { InstalledFunctionSchema } from '../interfaces';
import { CurrentSelection, SelectionType } from '../models';
import { Activity } from '../../stage-add';
import { GRAPH_NAME } from '../constants';

export const selectStreamState = createFeatureSelector<FlogoStreamState>('stream');

export const selectSimulatorPanelOpen = createSelector(
  selectStreamState,
  (state: FlogoStreamState) => state.isSimulatorPanelOpen
);

export const selectTriggers = createSelector(
  selectStreamState,
  (streamState: FlogoStreamState) => streamState.triggers
);

export const selectHandlers = createSelector(
  selectStreamState,
  (streamState: FlogoStreamState) => streamState.handlers
);

export const selectApp = createSelector(
  selectStreamState,
  (streamState: FlogoStreamState) => streamState.app
);

export const selectActionId = createSelector(
  selectStreamState,
  (streamState: FlogoStreamState) => streamState.id
);

export const selectTriggerConfigure = createSelector(
  selectStreamState,
  (streamState: FlogoStreamState) => streamState.triggerConfigure
);

export const selectAppInfo = createSelector(
  selectApp,
  app => {
    if (!app) {
      return {
        appId: null,
      };
    }
    return {
      appId: app.id,
    };
  }
);

export const selectStreamMetadata = createSelector(
  selectStreamState,
  (streamState: FlogoStreamState) => streamState.metadata
);

export const selectSchemas = createSelector(
  selectStreamState,
  (streamState: FlogoStreamState) => streamState.schemas
);

export const getInstalledFunctions = createSelector(
  selectSchemas,
  (schemas: Dictionary<FunctionsSchema>): InstalledFunctionSchema[] => {
    return Object.values(schemas)
      .filter(schema => schema.type === ContributionType.Function)
      .map(schema => ({
        functions: schema.functions,
        name: schema.name,
        type: schema.type,
        ref: schema.ref,
      }));
  }
);

export const selectGraph = createSelector(
  selectStreamState,
  streamState => streamState[GRAPH_NAME]
);

export const selectCurrentSelection = createSelector(
  selectStreamState,
  (state: FlogoStreamState) => state.currentSelection
);

export const getDiagramSelection = createSelector(
  selectCurrentSelection,
  (selection: CurrentSelection) => {
    if (selection && selection.type === SelectionType.InsertTask) {
      return {
        type: DiagramSelectionType.Insert,
        taskId: selection.parentId,
      };
    } else if (selection && selection.type === SelectionType.Task) {
      return {
        type: DiagramSelectionType.Node,
        taskId: selection.taskId,
      };
    } else {
      return null;
    }
  }
);

export const getStagesAsTiles = createSelector(
  selectGraph,
  (graph: DiagramGraph) => {
    return graphToTiles(graph);
  }
);

function graphToTiles(graph) {
  let currentId = graph.rootId;
  const tiles: Tile[] = [];
  while (currentId) {
    const currentStage = graph.nodes[currentId];
    if (currentStage) {
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
}

export const getInstalledActivities = createSelector(
  selectSchemas,
  (schemas: Dictionary<ContributionSchema>): Activity[] =>
    Object.values(schemas)
      .filter(
        schema =>
          schema.type === ContributionType.Activity && schema.ref !== CONTRIB_REFS.SUBFLOW
      )
      .map(schema => ({
        title: schema.title,
        ref: schema.ref,
      }))
      .sort((activity1, activity2) =>
        ('' + activity1.title).localeCompare(activity2.title)
      )
);

export const selectStageConfigure = createSelector(
  selectStreamState,
  (state: FlogoStreamState) => state.stageConfigure
);
