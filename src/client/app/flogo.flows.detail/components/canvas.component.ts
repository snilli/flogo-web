import { Component } from 'angular2/core';
import { RouteConfig, RouterOutlet, RouteParams, Router } from 'angular2/router';
import {PostService} from '../../../common/services/post.service';
import { FlogoCanvasFlowComponent } from '../../flogo.flows.detail.graphic/components/flow.component';
import { FlogoFlowsDetailDiagramComponent } from '../../flogo.flows.detail.diagram/components';
import {FlogoFlowsDetail} from './flow-detail.component';
import {FlogoFlowsDetailTriggers} from '../../flogo.flows.detail.triggers/components/triggers.component';
import {FlogoFlowsDetailTriggersDetail} from '../../flogo.flows.detail.triggers.detail/components/detail.component';
import {FlogoFlowsDetailTasks} from '../../flogo.flows.detail.tasks/components/tasks.component';
import {FlogoFlowsDetailTasksDetail} from '../../flogo.flows.detail.tasks.detail/components/detail.component';

import {
  IFlogoFlowDiagramTaskDictionary,
  IFlogoFlowDiagram
} from '../../../common/models';

import { SUB_EVENTS as FLOGO_DIAGRAM_PUB_EVENTS, PUB_EVENTS as FLOGO_DIAGRAM_SUB_EVENTS } from '../../flogo.flows.detail.diagram/messages';

import { SUB_EVENTS as FLOGO_TRIGGERS_PUB_EVENTS, PUB_EVENTS as FLOGO_TRIGGERS_SUB_EVENTS } from '../../flogo.flows.detail.triggers/messages';

import { SUB_EVENTS as FLOGO_ADD_TASKS_PUB_EVENTS, PUB_EVENTS as FLOGO_ADD_TASKS_SUB_EVENTS } from '../../flogo.flows.detail.tasks/messages';

import { SUB_EVENTS as FLOGO_SELECT_TASKS_PUB_EVENTS, PUB_EVENTS as FLOGO_SELECT_TASKS_SUB_EVENTS } from '../../flogo.flows.detail.tasks.detail/messages';

import {PUB_EVENTS as FLOGO_TASK_SUB_EVENTS, SUB_EVENTS as FLOGO_TASK_PUB_EVENTS } from '../../flogo.task/messages'

import { RESTAPIService } from '../../../common/services/rest-api.service';
import { RESTAPIFlowsService } from '../../../common/services/restapi/flows-api.service';
import { FlogoFlowDiagram } from '../../flogo.flows.detail.diagram/models/diagram.model';

@Component( {
  selector: 'flogo-canvas',
  moduleId: module.id,
  directives: [ RouterOutlet, FlogoCanvasFlowComponent, FlogoFlowsDetailDiagramComponent ],
  templateUrl: 'canvas.tpl.html',
  styleUrls: [ 'canvas.component.css' ]
} )

@RouteConfig([
  {path:'/',    name: 'FlogoFlowsDetailDefault',   component: FlogoFlowsDetail, useAsDefault: true},
  {path:'/trigger/add',    name: 'FlogoFlowsDetailTriggerAdd',   component: FlogoFlowsDetailTriggers},
  {path:'/trigger/:id',    name: 'FlogoFlowsDetailTriggerDetail',   component: FlogoFlowsDetailTriggersDetail},
  {path:'/task/add',    name: 'FlogoFlowsDetailTaskAdd',   component: FlogoFlowsDetailTasks},
  {path:'/task/:id',    name: 'FlogoFlowsDetailTaskDetail',   component: FlogoFlowsDetailTasksDetail}
])

export class FlogoCanvasComponent {
  _subscriptions : any[];

  _currentProcessID: string;
  _isCurrentProcessDirty = true;
  _hasUploadedProcess: boolean;
  _uploadingProcess: boolean;

  // TODO
  //  Remove this mock
  _mockLoading = true;
  _mockStartingProcess: boolean;
  _mockGettingStepsProcess: boolean;
  _mockSteps: any;
  _mockProcess: any;
  _mockProcessInstanceID: string;
  _mockDataToRestart : string = JSON.stringify(
    {
      'petId' : '201602222302661',
      'process' : 'false',
      'message' : ''
    }
  );

  private initSubscribe() {
    this._subscriptions = [];

    let subs = [
      _.assign( {}, FLOGO_DIAGRAM_SUB_EVENTS.addTask, { callback : this._addTaskFromDiagram.bind( this ) } ),
      _.assign( {}, FLOGO_DIAGRAM_SUB_EVENTS.addTrigger, { callback : this._addTriggerFromDiagram.bind( this ) } ),
      _.assign( {}, FLOGO_DIAGRAM_SUB_EVENTS.selectTask, { callback : this._selectTaskFromDiagram.bind( this ) } ),
      _.assign( {}, FLOGO_DIAGRAM_SUB_EVENTS.selectTrigger, { callback : this._selectTriggerFromDiagram.bind( this ) } ),
      _.assign( {}, FLOGO_TRIGGERS_SUB_EVENTS.addTrigger, { callback : this._addTriggerFromTriggers.bind( this ) } ),
      _.assign( {}, FLOGO_ADD_TASKS_SUB_EVENTS.addTask, { callback : this._addTaskFromTasks.bind( this ) } ),
      _.assign( {}, FLOGO_SELECT_TASKS_SUB_EVENTS.selectTask, { callback : this._selectTaskFromTasks.bind( this ) } ),
      _.assign( {}, FLOGO_TASK_SUB_EVENTS.runFromThisTile, { callback : this._runFromThisTile.bind( this ) } )
      // _.assign( {}, FLOGO_GRAPHIC_SUB_EVENTS.selectTrigger, { callback : this._selectTriggerGraphic.bind( this ) } )
    ];

    _.each(
      subs, sub => {
        this._subscriptions.push( this._postService.subscribe( sub ) );
      }
    );
  }

  ngOnDestroy() {
    _.each( this._subscriptions, sub => {
        this._postService.unsubscribe( sub );
      }
    );
  }

  private tasks: IFlogoFlowDiagramTaskDictionary;
  private diagram: IFlogoFlowDiagram;
  private _flow: any;

  constructor(
    private _postService: PostService,
    private _restAPIService: RESTAPIService,
    private _restAPIFlowsService: RESTAPIFlowsService,
    private _routerParams: RouteParams,
    private _router: Router
  ) {
    this._hasUploadedProcess = false ;

    // TODO
    //  Remove this mock
    this._mockLoading = true;

    //  get the flow by ID
    let id = '' + this._routerParams.params[ 'id' ];

    try {
      id = atob( id );
    } catch ( e ) {
      console.warn( e );
    }

    this._restAPIFlowsService.getFlow(id)
      .then(
        ( rsp : any )=> {

          if ( !_.isEmpty( rsp ) ) {
            // initialisation
            console.group( 'Initialise canvas component' );

            this._flow = rsp;

            this.tasks = this._flow.items;
            if ( _.isEmpty( this._flow.paths ) ) {
              this.diagram = this._flow.paths = <IFlogoFlowDiagram>{
                root : {},
                nodes : {}
              };
            } else {
              this.diagram = this._flow.paths;
            }

            this.initSubscribe();

            console.groupEnd();

            return this._updateFlow( this._flow );
          } else {
            return this._flow;
          }
        }
      )
      .then(
        ()=> {
          this._mockLoading = false;
        }
      )
      .catch(
        ( err )=> {
          if ( err.status === 404 ) {

            // TODO
            //  this is a mock
            // provision database with a random flow
            // then just to open that flow
            return this._restAPIFlowsService.createFlow(
              {
                "paths" : {},
                "name" : "Payroll Distribution",
                "description" : "This is a demo flow",
                "items" : {}
              }
              )
              .then(
                ( rsp : any )=> {
                  console.log( rsp );
                  this._router.navigate(
                    [
                      'FlogoFlowDetail',
                      { id : btoa( rsp.id ) }
                    ]
                  );  // navigation triggered
                }
              );

          }
        }
      );
  }

  // TODO
  //  Remove this mock later
  private _updateMockProcess() {
    if ( !_.isEmpty( this._flow ) ) {
      this._restAPIFlowsService.getFlows()
        .then(
          ( rsp : any ) => {
            this._mockProcess = _.find( rsp, { _id : this._flow._id } );
            this._mockProcess = _.assign(
              new FlogoFlowDiagram( this._mockProcess.paths, this._mockProcess.items ).toProcess(), { id : btoa( this._flow._id ) }
            );
          }
        );
    }
  }

  private _runFromTrigger() {

    return this.uploadProcess()
      .then(
        (rsp : any) => {
          if ( !_.isEmpty( rsp ) ) {
            return this.mockStartProcess( rsp.id );
          } else {
            // the process isn't changed
            return this.mockStartProcess( this._currentProcessID );
          }
        }
      )
      .then(
        () => {
          return this.mockGetSteps();
        }
      );
  }

  private _updateFlow( flow : any ) {
    this._isCurrentProcessDirty = true;

    // processing this._flow to pure JSON object
    flow = _.cloneDeep( flow );
    _.each(
      _.keys( flow.paths ), ( key : string ) => {
        if ( key !== 'root' && key !== 'nodes' ) {
          delete flow.paths[ key ];
        }
      }
    );
    flow = JSON.parse( JSON.stringify( flow ) );

    return this._restAPIFlowsService.updateFlow( flow )
      .then(
        ( rsp : any ) => {
          console.log( rsp );
        }
      )
      .then(
        () => {
          // TODO
          //  remove this mock
          return this._updateMockProcess();
        }
      );
  }

  uploadProcess() {
    this._uploadingProcess = true;

    // generate process based on
    let process = _.assign(
      new FlogoFlowDiagram( this._flow.paths, this._flow.items ).toProcess(), { id : btoa( this._flow._id ) }
    );

    return this._restAPIFlowsService.uploadFlow( process ).then((rsp:any) => {
      this._uploadingProcess = false;
      this._hasUploadedProcess = true;
      if ( !_.isEmpty( rsp ) ) {
        this._currentProcessID = rsp.id;
        this._isCurrentProcessDirty = false;
      }

      return rsp;
    });
  }

  // TODO
  //  Remove this mock later
  mockStartProcess( id? : string ) {
    this._mockStartingProcess = true;
    this._mockSteps = null;

    return this._restAPIFlowsService.startFlow(
        id || this._currentProcessID, {
          // "petId" : "20160222230266"
        }
      )
      .then(
        ( rsp : any )=> {
          this._mockStartingProcess = false;
          this._mockProcessInstanceID = rsp.id;
        }
      )
      .then(
        ( rsp : any ) => {
          console.log( rsp );
        }
      )
      .catch(
        ( err : any )=> {
          this._mockStartingProcess = false;
          console.error( err );
        }
      );
  }

  // TODO
  //  Remove this mock later
  mockGetSteps() {
    this._mockGettingStepsProcess = true;

    if ( this._mockProcessInstanceID ) {
      return this._restAPIService.instances.whenInstanceFinishByID( this._mockProcessInstanceID )
        .then(
          ( rsp : any ) => {
            return this._restAPIService.instances.getStepsByInstanceID( rsp.id );
          }
        )
        .then(
          ( rsp : any ) => {
            this._mockGettingStepsProcess = false;
            this._mockSteps = rsp.steps;
            console.log( rsp );
          }
        )
        .catch(
          ( err : any )=> {
            this._mockGettingStepsProcess = false;
            console.error( err );
          }
        );
    } else {
      console.warn( 'No process has been started.' );
    }
  }

  trackBySteps( idx : number, s : {id : string, [key : string] : string} ) {
    return s.id;
  }

  // TODO
  //  Remove this mock later
  mockRestartFrom( step : number, mockDataToRestart:string ) {
    this._mockStartingProcess = true;
    this._mockSteps = null;

    return this._restAPIService.flows.restartFrom(
      this._mockProcessInstanceID, JSON.parse( mockDataToRestart ), step
      )
      .then(
        ( rsp : any ) => {
          this._mockProcessInstanceID = rsp.id;
          this._mockStartingProcess = false;
        }
      )
      .catch(
        ( err : any )=> {
          this._mockStartingProcess = false;
          console.error( err );
        }
      );
  }

  private _addTriggerFromDiagram( data : any, envelope : any ) {
    console.group( 'Add trigger message from diagram' );

    console.log( data );
    console.log( envelope );

    this._router.navigate( [ 'FlogoFlowsDetailTriggerAdd' ] )
      .then(
        () => {
          console.group( 'after navigation' );

          this._postService.publish(
            _.assign(
              {}, FLOGO_TRIGGERS_PUB_EVENTS.addTrigger, {
                data : data
              }
            )
          );

          console.groupEnd();
    });

    console.groupEnd( );
  }

  private _addTriggerFromTriggers( data: any, envelope: any) {
    console.group( 'Add trigger message from trigger' );

    console.log( data );
    console.log( envelope );

    this.tasks[ data.trigger.id ] = data.trigger;

    this._router.navigate( [ 'FlogoFlowsDetailDefault' ] )
      .then(
        ()=> {
          this._postService.publish(
            _.assign(
              {}, FLOGO_DIAGRAM_PUB_EVENTS.addTrigger, {
                data : {
                  node : data.node,
                  task : data.trigger
                },
                done : ( diagram : IFlogoFlowDiagram ) => {
                  _.assign( this.diagram, diagram );
                  this._updateFlow( this._flow );
                }
              }
            )
          );
        }
      );

    console.groupEnd( );

  }

  private _addTaskFromDiagram( data: any, envelope: any ) {
    console.group( 'Add task message from diagram' );

    console.log( data );
    console.log( envelope );

    this._router.navigate( [ 'FlogoFlowsDetailTaskAdd' ] )
      .then(
        () => {
          console.group( 'after navigation' );

          this._postService.publish(
            _.assign(
              {}, FLOGO_ADD_TASKS_PUB_EVENTS.addTask, {
                data : data
              }
            )
          );

          console.groupEnd();
        });

    console.groupEnd( );
  }

  private _addTaskFromTasks( data: any, envelope: any) {
    console.group( 'Add task message from task' );

    console.log( data );
    console.log( envelope );

    this.tasks[ data.task.id ] = data.task;

    this._router.navigate( [ 'FlogoFlowsDetailDefault' ] )
      .then(
        ()=> {
          this._postService.publish(
            _.assign(
              {}, FLOGO_DIAGRAM_PUB_EVENTS.addTask, {
                data : {
                  node : data.node,
                  task : data.task
                },
                done : ( diagram : IFlogoFlowDiagram ) => {
                  _.assign( this.diagram, diagram );
                  this._updateFlow( this._flow );
                }
              }
            )
          );
        }
      );

    console.groupEnd( );

  }


  private _selectTriggerFromDiagram( data: any, envelope: any ) {
    console.group( 'Select trigger message from diagram' );

    console.log( data );
    console.log( envelope );


    this._router.navigate(
      [
        'FlogoFlowsDetailTaskDetail',
        { id : data.node.taskID }
      ]
      )
      .then(
        () => {
          console.group( 'after navigation' );

          // Refresh task detail
          let stepNumber = this._getStepNumberFromTask(data.node.taskID);
          data.step = {result:(stepNumber && this._mockSteps) ? this._mockSteps[stepNumber - 1] : null,
            number: stepNumber};
          this._postService.publish(
            _.assign(
              {}, FLOGO_SELECT_TASKS_PUB_EVENTS.selectTask, {
                data : _.assign( {}, data, { task : _.cloneDeep( this.tasks[ data.node.taskID ] ) } ),

                done: () => {
                  // select task done
                  //  only need this publish if the trigger has been changed
                  this._postService.publish(
                    _.assign(
                      {}, FLOGO_DIAGRAM_PUB_EVENTS.selectTrigger, {
                        data : {
                          node : data.node,
                          task : this.tasks[ data.node.taskID ]
                        },
                        done : ( diagram : IFlogoFlowDiagram ) => {
                          _.assign( this.diagram, diagram );
                          this._updateFlow( this._flow );
                        }
                      }
                    )
                  );

                }
              }
            )
          );

        }
      );


    console.groupEnd( );
  }


  private _selectTaskFromDiagram( data: any, envelope: any ) {
    console.group( 'Select task message from diagram' );
    console.log( data );
    console.log( envelope );

    this._router.navigate(
      [
        'FlogoFlowsDetailTaskDetail',
        { id : data.node.taskID }
      ]
      )
      .then(
        () => {
          console.group( 'after navigation' );

          // Refresh task detail
          let stepNumber = this._getStepNumberFromTask(data.node.taskID);
          data.step = {result:(stepNumber && this._mockSteps) ? this._mockSteps[stepNumber - 1] : null,
            number: stepNumber};
          this._postService.publish(
            _.assign(
              {}, FLOGO_SELECT_TASKS_PUB_EVENTS.selectTask, {
                data : _.assign( {}, data, { task : _.cloneDeep( this.tasks[ data.node.taskID ] ) } ),

                done: () => {
                  // select task done
                  this._postService.publish(
                    _.assign(
                      {}, FLOGO_DIAGRAM_PUB_EVENTS.selectTask, {
                        data : {
                          node : data.node,
                          task : this.tasks[ data.node.taskID ]
                        },
                        done : ( diagram : IFlogoFlowDiagram ) => {
                          _.assign( this.diagram, diagram );
                          this._updateFlow( this._flow );
                        }
                      }
                    )
                  );

                }
              }
            )
          );

        }
      );

    console.groupEnd( );
  }

  private _selectTaskFromTasks( data: any, envelope: any) {
    console.group( 'Select task message from task' );

    console.log( data );
    console.log( envelope );

    this.tasks[ data.task.id ] = data.task;

    this._router.navigate( [ 'FlogoFlowsDetailDefault' ] )
      .then(
        ()=> {
          this._postService.publish(
            _.assign(
              {}, FLOGO_DIAGRAM_PUB_EVENTS.selectTask, {
                data : {
                  node : data.node,
                  task : data.task
                },
                done : ( diagram : IFlogoFlowDiagram ) => {
                  _.assign( this.diagram, diagram );
                  this._updateFlow( this._flow );
                }
              }
            )
          );
        }
      );

    console.groupEnd( );

  }

  // based on the task id, look in the task list to get the number of the step
  //  TODO check if there is another way of get the step number
  private _getStepNumberFromTask(taskId:string) {
    let index = 0;
    let tasks = this.tasks || [];

    for(let task in tasks) {
      if(task == taskId) {
        return index +1;
      }
      ++index;
    }

    return 0;
  }

  private _getStepNumberFromSteps(taskId:string) {
    var stepNumber:number = 0;
    let steps = this._mockSteps || [];

    steps.forEach((step:any, index:number) => {
      if(step.taskId == taskId) {
        stepNumber = index + 1;
      }
    });

    return stepNumber;
  }


  private _runFromThisTile(data:any, envelope:any) {
    console.group('Run from this tile');
    var step = this._getStepNumberFromSteps(data.taskId);

    if(this._mockProcessInstanceID) {

      if(step) {
        this.mockRestartFrom(step, JSON.stringify(data.inputs))
          .then(()=> {
            let maxQuery = 10;
            let queriedTime = 0;
            var queryStatus = setInterval(function() {

              this._restAPIService.instances.getStatusByInstanceID(this._mockProcessInstanceID)
                .then((result:any) => {
                  let status = result.status && result.status.toString(); // status null doesn't mean it failed
                  switch(status) {
                    case '0':
                      console.log('Process not start, queriedTime',queriedTime);
                      break;
                    case '100':
                      console.log('Process in progress, queriedTime',queriedTime);
                      break;
                    case '500':
                      console.log('Process finished, queriedTime',queriedTime);
                      console.log('Result', result);
                      this._restAPIService.instances.getStepsByInstanceID(this._mockProcessInstanceID)
                            .then((result:any) => {
                              this._mockSteps = result.steps;
                              var resultTask = this._mockSteps.find((step:any) => {
                                return step.taskId == data.taskId;

                              });

                              this._postService.publish(
                                _.assign({}, FLOGO_TASK_PUB_EVENTS.updateTaskResults, {data:{result:resultTask}})
                              )
                            });
                      clearInterval(queryStatus);
                      break;
                    case '600':
                      console.log('Process cancelled, queriedTime',queriedTime);
                      console.log('Result:', result);
                      clearInterval(queryStatus);
                      break;
                    case '700':
                      console.log('Process failed, queriedTime',queriedTime);
                      clearInterval(queryStatus);
                      break;
                  }
                  queriedTime++;
                  if(queriedTime>maxQuery){
                    console.error("getStates timeout");
                    clearInterval(queryStatus);
                    console.groupEnd();
                  }
                });
            }.bind(this), 500);
          }).
          then(()=> {

          if(_.isFunction(envelope.done)) {
            envelope.done();
          }

        })

      }
    } else {
      this._runFromTrigger();
      //console.error('You have not run the processs yet');
    }

    console.groupEnd();

  }

  // private _selectTriggerGraphic() {
  //   this.disposeLoadedComponent();
  //   console.group("FlogoNavbarComponent -> select trigger");
  //   console.log("receive: ", arguments);
  //   this._router.navigate(['FlogoFlowsDetailTriggerDetail', {id:1}]);
  //   console.groupEnd();
  // }

}
