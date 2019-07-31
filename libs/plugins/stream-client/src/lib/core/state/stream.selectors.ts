import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FlogoStreamState } from './stream.state';
import {Dictionary} from "@flogo-web/lib-client/core";
import {ContributionType, FunctionsSchema} from "@flogo-web/core";
import {InstalledFunctionSchema} from "../interfaces";

export const selectStreamState = createFeatureSelector<FlogoStreamState>('stream');

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
