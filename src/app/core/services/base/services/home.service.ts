import {Observable} from 'rxjs';
import {ApiState} from '../../../models/api.state';

export interface IHomeService<TModel> {
  getHomeItems(): Observable<ApiState<TModel[]>>;
}
