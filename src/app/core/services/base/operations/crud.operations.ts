import {catchError, map, Observable, of} from 'rxjs';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';

export class CrudOperations<TDto, TModel> {
  constructor(
    private http: HttpClient,
    private baseUrl: string,
    private mapper: (dto: TDto) => TModel,
    private entityName: string = 'Entity'
  ) {
  }

  getAll(): Observable<TModel[]> {
    return this.http.get<TDto[]>(this.baseUrl).pipe(
      map(dtos => dtos.map(dto => this.mapper(dto))),
      catchError(err => this.handleError(err, 'getAll', []))
    );
  }

  getById(id: string): Observable<TModel | null> {
    return this.http.get<TDto>(`${this.baseUrl}/${id}`).pipe(
      map(dto => this.mapper(dto)),
      catchError(err => this.handleError(err, `getById(${id})`, null))
    );
  }

  private handleError<T>(error: HttpErrorResponse, operation: string, fallback: T): Observable<T> {
    console.error(`${this.entityName} ${operation} error:`, error);
    return of(fallback);
  }
}
