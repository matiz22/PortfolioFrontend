import {Observable} from 'rxjs';
import {ApiState} from '../../../models/api.state';

export interface ICrudService<TModel> {
  getAll(): Observable<ApiState<TModel[]>>;

  getById(id: string): Observable<ApiState<TModel>>;
}
