import { get, filter as _filter } from 'lodash';
import { Injectable } from '@angular/core';

import { Observable, throwError as _throw } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import {
  flowToJSON_Link,
  Interceptor,
  InterceptorTask,
  Snapshot,
  Step,
} from '../../interfaces';
import { RestApiService } from './rest-api.service';

/**
 * Possible run status
 */
export enum RunStatusCode {
  NotStarted = '0',
  Active = '100',
  Completed = '500',
  Cancelled = '600',
  Failed = '700',
}

/**
 * Possible run state
 */
export enum RunTaskStatusCode {
  Done = 40,
  Skipped = 50,
  Failed = 100,
}

/**
 * Possible flow types in Step response
 */

export enum StepFlowType {
  MainFlow = '0',
  SubFlow = '1',
}

export interface StatusResponse {
  id: string;
  /**
   * A value from RunStatusCode or null
   * @see RunStatusCode
   */
  status: string | null;
}

export interface StoredProcessResponse {
  creationDate: string;
  description: string;
  id: string;
  name: string;
}

export interface RestartResponse {
  id: string;
}

@Injectable()
export class RunApiService {
  constructor(private restApi: RestApiService) {}

  getStatusByInstanceId(instanceId: string): Observable<StatusResponse | null> {
    return this.restApi.get(`runner/instances/${instanceId}/status`);
  }

  getStepsByInstanceId(instanceId: string): Observable<Step[]> {
    return this.restApi.get(`runner/instances/${instanceId}/steps`);
  }

  getSnapshot(instanceId: string, snapshotId: number): Observable<Snapshot> {
    return this.restApi.get(`runner/instances/${instanceId}/snapshot/${snapshotId}`);
  }

  // todo: data interface
  // todo: response interface
  startProcess(flowId: string, data: any): Observable<any> {
    return this.restApi.post<any>(`runner/processes/${flowId}/start`, {
      attrs: data,
    });
  }

  storeProcess(flowId: string): Observable<StoredProcessResponse> {
    return this.restApi.post<StoredProcessResponse>('runner/processes', {
      actionId: flowId,
    });
  }

  // TODO: original name was restartWithIcptFrom, what is "icpt?
  // TODO
  //  to do proper restart process, need to select proper snapshot, hence
  //  the current implementation is only for the last start-from-beginning snapshot, i.e.
  //  the using this.runState.processInstanceId to restart
  restartFrom(
    processInstanceId: string,
    step: number,
    interceptor: Interceptor,
    updateProcessId?: string
  ): Observable<RestartResponse> {
    // get the state of the last step
    if (step < 0) {
      return _throw(new Error(`Invalid step ${step} to start from.`));
    }
    const snapshotId = step !== 0 ? step : 1;

    return this.getSnapshot(processInstanceId, snapshotId).pipe(
      map(snapshot =>
        updateProcessId ? updateSnapshotActionUri(snapshot, updateProcessId) : snapshot
      ),
      switchMap(snapshot => {
        // TODO: flowinfo interface
        return this.restApi.get(`runner/processes/${updateProcessId}`).pipe(
          map(flowInfo => {
            const links = get(flowInfo, 'rootTask.links', []);
            return { snapshot, links };
          })
        );
      }),
      switchMap(({ snapshot, links }) => {
        // process state info based on flowInfo
        // find all of the tasks in the path of the given tasks to intercept.
        // i.e. remove the tasks that won't get executed because they are not linked
        const taskIdsInPath = this.findTaskIdsInLinkPath(interceptor.tasks, links);
        // get rid of the tasks that don't need to be executed
        const filteredSnapshot = this.filterSnapshot(snapshot, taskIdsInPath);

        // then restart from that state with data
        // TODO: document response data
        return this.restApi.post<RestartResponse>('runner/processes/restart', {
          initialState: filteredSnapshot,
          interceptor,
        });
      })
    );

    function updateSnapshotActionUri(snapshot, newFlowId) {
      // replace the old flowURI with the newFlowID
      const pattern = new RegExp('flows/(.+)$');
      const {flowURI} = snapshot;
      return {
        ...snapshot,
        flowURI: flowURI.replace(pattern, `flows/${newFlowId}`)
      };
    }
  }

  /**
   * Remove from the snapshot the info of the tasks that are NOT in the taskIds
   * @param snapshot
   * @param taskIds
   * @return {any}
   */
  private filterSnapshot(snapshot: Snapshot, taskIds: string[]) {
    let workQueue = snapshot.workQueue || [];
    snapshot.rootTaskEnv = snapshot.rootTaskEnv || {};
    let taskData = snapshot.rootTaskEnv.taskDatas || [];

    // filter out the tasks that are not in the path
    workQueue = _filter(workQueue, (queueItem: any) => {
      return taskIds.indexOf(queueItem.taskID) !== -1;
    });

    // filter out the tasks that are not in the path
    taskData = _filter(taskData, (taskDatum: any) => {
      return (
        taskDatum.taskId === '1' ||
        taskDatum.taskId === 1 ||
        taskIds.indexOf(taskDatum.taskId) !== -1
      );
    });

    snapshot.workQueue = workQueue;
    // "taskDatas" in plural is not a typo, that's how the API expects it
    snapshot.rootTaskEnv.taskDatas = taskData;

    return snapshot;
  }

  // TODO: left algorithm as it was when refactored, need to make it clearer
  private findTaskIdsInLinkPath(tasks: InterceptorTask[], links: flowToJSON_Link[]) {
    // TODO: icpt, what does it mean?? for icpTaskIds
    const tasksIdsInPath: string[] = (tasks || []).map((task: any) => task.id);
    let linksToGo = links.slice();
    let lastLinksToGoLength = linksToGo.length;

    const filterLinksAndAccumulateTasks = (link: any) => {
      if (tasksIdsInPath.indexOf(link.from) !== -1) {
        // avoid duplications
        if (tasksIdsInPath.indexOf(link.to) === -1) {
          tasksIdsInPath.push(link.to);
        }
        return false;
      }
      return true;
    };

    // once the linksToGo stay the same or empty, then finish
    while (linksToGo.length) {
      linksToGo = _filter(linksToGo, filterLinksAndAccumulateTasks);
      if (lastLinksToGoLength === linksToGo.length) {
        break;
      }
      lastLinksToGoLength = linksToGo.length;
    }
    return tasksIdsInPath;
  }
}
