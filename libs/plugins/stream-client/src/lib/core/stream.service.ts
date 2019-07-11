import { Injectable } from '@angular/core';
import { ContributionsService, normalizeTriggersAndHandlersForResource } from '@flogo-web/lib-client/core';
import { tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Init } from './state/stream.actions';
import { StreamStoreState } from './state/stream.state';

@Injectable()
export class StreamService {

  constructor( private contribService: ContributionsService, private store: Store<StreamStoreState>) { }
  /* streams-plugin-todo: Replace any with API resource interface of Stream */
  loadStream(resource: any) {
    const {id, name, description, app, triggers: originalTriggers} = resource;
    const {triggers, handlers} = normalizeTriggersAndHandlersForResource(id, originalTriggers);
    return this.contribService.listAllContribs().pipe(
      tap((contributions) => {
        /* streams-plugin-todo: need to process only app name and app id in app object in designer page */
        this.store.dispatch(new Init({
          id,
          name,
          description,
          app,
          triggers,
          handlers,
          schemas: null,
          mainGraph: null,
          mainItems: null
        }));
      })
    );
  }


}
