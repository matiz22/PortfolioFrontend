import {Observable} from 'rxjs';
import {ApiState} from '../../../models/api.state';
import {PaginationMeta} from '../../../models/pagination-meta';

export interface ISummaryService<TModel> {
  getAllSummary(): Observable<ApiState<TModel[]>>;
  getByIdSummary(id: string): Observable<ApiState<TModel>>;
  getBySlugSummary(slug: string): Observable<ApiState<TModel>>;
  getAllSummaryPaginated(page?: number): Observable<ApiState<{ data: TModel[], meta: PaginationMeta }>>;
}
