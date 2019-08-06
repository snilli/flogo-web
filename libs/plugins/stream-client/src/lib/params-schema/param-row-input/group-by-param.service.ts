import { Subject } from 'rxjs';
export class GroupByParamService {
  private updateGroupBySubscriber = new Subject();
  updateGroupBy$ = this.updateGroupBySubscriber.asObservable();
  selectedGroupBy: string;

  updateGroupBy(groupByParam) {
    this.selectedGroupBy = groupByParam;
    this.updateGroupBySubscriber.next();
  }
}
