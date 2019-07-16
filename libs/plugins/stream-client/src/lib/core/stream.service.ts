import { Injectable } from '@angular/core';
import { tap, take, switchMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { ContributionsService, ResourceService } from '@flogo-web/lib-client/core';
import { ContributionType } from '@flogo-web/core';

import { Init, StreamStoreState } from './state';
import * as streamSelectors from './state/stream.selectors';
import { generateStateFromResource, generateResourceFromState } from './models';

@Injectable()
export class StreamService {
  constructor(
    private contribService: ContributionsService,
    private resourceService: ResourceService,
    private store: Store<StreamStoreState>
  ) {}

  /* streams-plugin-todo: Replace any with API resource interface of Stream */
  loadStream(resource: any) {
    return this.contribService.listAllContribs().pipe(
      tap(contributions => {
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

  saveStream() {
    return this.store.select(streamSelectors.selectStreamState).pipe(
      take(1),
      switchMap(state => {
        const updatedStream = generateResourceFromState(state);
        return this.resourceService.updateResource(state.id, updatedStream);
      })
    );
  }
}
