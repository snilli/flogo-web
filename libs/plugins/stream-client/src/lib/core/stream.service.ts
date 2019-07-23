import { Injectable } from '@angular/core';
import { tap, take, switchMap, catchError } from 'rxjs/operators';
import { Action, Store } from '@ngrx/store';

import { ContributionsService, ResourceService } from '@flogo-web/lib-client/core';
import { ContributionType } from '@flogo-web/core';

import { Init, RevertName, StreamActionType, StreamStoreState } from './state';
import * as streamSelectors from './state/stream.selectors';
import { generateStateFromResource, generateResourceFromState } from './models';
import { NotificationsService } from '@flogo-web/lib-client/notifications';
import { of } from 'rxjs';
import { isEmpty } from 'lodash';

@Injectable()
export class StreamService {
  previousStream = null;
  constructor(
    private contribService: ContributionsService,
    private resourceService: ResourceService,
    private notifications: NotificationsService,
    private store: Store<StreamStoreState>
  ) {}

  /* streams-plugin-todo: Replace any with API resource interface of Stream */
  loadStream(resource: any) {
    return this.contribService.listAllContribs().pipe(
      tap(contributions => {
        this.previousStream = resource;
        /* streams-plugin-todo: need to process only app name and app id in app object in designer page */
        this.store.dispatch(
          new Init(
            generateStateFromResource(
              resource,
              contributions.filter(schema => schema.type === ContributionType.Activity)
            )
          )
        );
      })
    );
  }

  listStreamsByName(appId, name) {
    return this.resourceService.listResourcesWithName(name, appId);
  }

  saveStreamName() {
    return this.store.select(streamSelectors.selectStreamState).pipe(
      take(1),
      switchMap(state => {
        return this.listStreamsByName(state.app.id, state.name).pipe(
          switchMap(streams => {
            const results = streams || [];
            if (!isEmpty(results)) {
              if (results[0].id === state.id) {
                return;
              }
              /* streams-plugin-todo: create reusable method for success/error notifications */
              this.notifications.error({
                key: 'STREAMS.DESIGNER:ERROR-STREAM-NAME-EXISTS',
                params: { value: state.name },
              });
              this.store.dispatch(new RevertName(this.previousStream.name));
              return of(false);
            } else {
              const updatedStream = generateResourceFromState(state);
              return this.resourceService.updateResource(state.id, updatedStream).pipe(
                tap(() => {
                  this.previousStream = updatedStream;
                  this.notifications.success({
                    key: 'STREAMS.DESIGNER:SUCCESS-UPDATE-STREAM',
                    params: { value: 'name' },
                  });
                })
              );
            }
          }),
          catchError(() => {
            this.notifications.error({
              key: 'STREAMS.DESIGNER:ERROR-UPDATE-STREAM',
              params: { value: 'name' },
            });
            return of(false);
          })
        );
      })
    );
  }

  saveStream(action?: Action) {
    return this.store.select(streamSelectors.selectStreamState).pipe(
      take(1),
      switchMap(state => {
        const updatedStream = generateResourceFromState(state);
        return this.resourceService.updateResource(state.id, updatedStream).pipe(
          tap(() => {
            this.previousStream = updatedStream;
            if (action && action.type === StreamActionType.ChangeDescription) {
              this.notifications.success({
                key: 'STREAMS.DESIGNER:SUCCESS-UPDATE-STREAM',
                params: { value: 'description' },
              });
            }
          }),
          catchError(() => {
            if (action.type === StreamActionType.ChangeDescription) {
              this.notifications.error({
                key: 'STREAMS.DESIGNER:ERROR-UPDATE-STREAM',
                params: { value: 'description' },
              });
            }
            return of(false);
          })
        );
      })
    );
  }
}
