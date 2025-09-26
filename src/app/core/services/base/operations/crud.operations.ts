import {catchError, map, Observable, of, startWith} from 'rxjs';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ApiState} from '../../../models/api.state';

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
      startWith(ApiState.loading<TModel[]>()),
      catchError(err => of(ApiState.error<TModel[]>(this.getErrorMessage(err))))
    );
  }

  getById(id: string): Observable<ApiState<TModel>> {
    return this.http.get<TDto>(`${this.baseUrl}/${id}`).pipe(
      map(dto => ApiState.success(this.mapper(dto))),
      startWith(ApiState.loading<TModel>()),
      catchError(err => of(ApiState.error<TModel>(this.getErrorMessage(err))))
    );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    return error.error?.message || `Failed to load ${this.entityName.toLowerCase()}.`;
  }
}
