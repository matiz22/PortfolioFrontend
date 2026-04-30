import {Observable} from 'rxjs';
import {ApiState} from '../../../models/api.state';

export interface ISlugService<TModel> {
  getBySlug(slug: string): Observable<ApiState<TModel>>;
}
