import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, map, Observable, of, startWith} from 'rxjs';
import {ApiState} from '../../../models/api.state';

export class HomeOperations<TDto, TModel> {
  constructor(
    private http: HttpClient,
    private homeUrl: string,
    private mapper: (dto: TDto) => TModel,
    private entityName: string = 'Entity'
  ) {
  }

  getHomeItems(): Observable<ApiState<TModel[]>> {
    return this.http.get<TDto[]>(this.homeUrl).pipe(
      map(dtos => ApiState.success(dtos.map(dto => this.mapper(dto)))),
      startWith(ApiState.loading<TModel[]>()),
      catchError(err => of(ApiState.error<TModel[]>(this.getErrorMessage(err))))
    );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    return error.error?.message || `Failed to load ${this.entityName.toLowerCase()}.`;
  }
}
