import {catchError, map, Observable, of} from 'rxjs';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ApiState} from '../../../models/api.state';
import {PaginatedResponse} from '../../../models/paginated-response';
import {PaginationMeta} from '../../../models/pagination-meta';

export class SummaryOperations<TDto, TModel> {
  constructor(
    private http: HttpClient,
    private summaryBaseUrl: string,
    private mapper: (dto: TDto) => TModel,
    private entityName: string = 'Entity'
  ) {
  }

  getAll(): Observable<ApiState<TModel[]>> {
    return this.http.get<TDto[]>(this.summaryBaseUrl).pipe(
      map(dtos => ApiState.success(dtos.map(dto => this.mapper(dto)))),
      catchError(err => of(ApiState.error<TModel[]>(this.getErrorMessage(err))))
    );
  }

  getById(id: string): Observable<ApiState<TModel>> {
    return this.http.get<TDto>(`${this.summaryBaseUrl}/${id}`).pipe(
      map(dto => ApiState.success(this.mapper(dto))),
      catchError(err => of(ApiState.error<TModel>(this.getErrorMessage(err))))
    );
  }

  getBySlug(slug: string): Observable<ApiState<TModel>> {
    return this.http.get<TDto>(`${this.summaryBaseUrl}/slug/${slug}`).pipe(
      map(dto => ApiState.success(this.mapper(dto))),
      catchError(err => of(ApiState.error<TModel>(this.getErrorMessage(err))))
    );
  }

  getAllPaginated(page: number = 1, perPage: number = 15): Observable<ApiState<{ data: TModel[], meta: PaginationMeta }>> {
    return this.http.get<PaginatedResponse<TDto>>(`${this.summaryBaseUrl}/paginated?page=${page}&perPage=${perPage}`).pipe(
      map(response => {
        const data = response.data.map(dto => this.mapper(dto));
        const meta: PaginationMeta = {
          currentPage: response.current_page,
          lastPage: response.last_page,
          perPage: response.per_page,
          total: response.total,
          from: response.from,
          to: response.to
        };
        return ApiState.success({ data, meta });
      }),
      catchError(err => of(ApiState.error<{ data: TModel[], meta: PaginationMeta }>(this.getErrorMessage(err))))
    );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    return error.error?.message || `Failed to load ${this.entityName.toLowerCase()} summary.`;
  }
}
