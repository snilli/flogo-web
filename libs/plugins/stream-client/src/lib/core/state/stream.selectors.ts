import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FlogoStreamState } from './stream.state';

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
