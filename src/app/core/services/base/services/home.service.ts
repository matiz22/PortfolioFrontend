import {Observable} from 'rxjs';
import {ApiState} from '../../../models/api.state';

export interface IHomeService<TModel, TSummaryModel = TModel> {
  getHomeItems(): Observable<ApiState<TModel[]>>;
  getHomeSummaryItems(): Observable<ApiState<TSummaryModel[]>>;
}
