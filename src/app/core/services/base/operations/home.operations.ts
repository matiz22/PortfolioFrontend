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
    console.error(`${this.entityName} home getHomeItems error:`, error);

    if (error.status === 0) {
      return 'Network error. Please check your connection.';
    }
    if (error.status >= 400 && error.status < 500) {
      return error.error?.message || `${this.entityName} not found or access denied.`;
    }
    if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }
    return error.error?.message || `Failed to load ${this.entityName.toLowerCase()}.`;
  }
}
