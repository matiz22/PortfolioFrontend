import {catchError, map, Observable, of} from 'rxjs';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ApiState} from '../../../models/api.state';
import {PaginatedResponse} from '../../../models/paginated-response';
import {PaginationMeta} from '../../../models/pagination-meta';

export class CrudOperations<TDto, TModel> {
  constructor(
    private http: HttpClient,
    private baseUrl: string,
    private mapper: (dto: TDto) => TModel,
    private entityName: string = 'Entity'
  ) {
  }

  getAll(): Observable<ApiState<TModel[]>> {
    return this.http.get<TDto[]>(this.baseUrl).pipe(
      map(dtos => ApiState.success(dtos.map(dto => this.mapper(dto)))),
      catchError(err => of(ApiState.error<TModel[]>(this.getErrorMessage(err))))
    );
  }

  getById(id: string): Observable<ApiState<TModel>> {
    return this.http.get<TDto>(`${this.baseUrl}/${id}`).pipe(
      map(dto => ApiState.success(this.mapper(dto))),
      catchError(err => of(ApiState.error<TModel>(this.getErrorMessage(err))))
    );
  }

  getAllPaginated(page: number = 1, perPage: number = 15): Observable<ApiState<{ data: TModel[], meta: PaginationMeta }>> {
    return this.http.get<PaginatedResponse<TDto>>(`${this.baseUrl}/paginated?page=${page}&perPage=${perPage}`).pipe(
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
    return error.error?.message || `Failed to load ${this.entityName.toLowerCase()}.`;
  }
}
