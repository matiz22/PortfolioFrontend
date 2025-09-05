import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, map, Observable, of} from 'rxjs';

export class HomeOperations<TDto, TModel> {
  constructor(
    private http: HttpClient,
    private homeUrl: string,
    private mapper: (dto: TDto) => TModel,
    private entityName: string = 'Entity'
  ) {
  }

  getHomeItems(): Observable<TModel[]> {
    return this.http.get<TDto[]>(this.homeUrl).pipe(
      map(dtos => dtos.map(dto => this.mapper(dto))),
      catchError(err => this.handleError(err, 'getHomeItems', []))
    );
  }

  private handleError<T>(error: HttpErrorResponse, operation: string, fallback: T): Observable<T> {
    console.error(`${this.entityName} home ${operation} error:`, error);
    return of(fallback);
  }
}
