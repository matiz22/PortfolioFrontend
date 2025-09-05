import {Observable} from 'rxjs';

export interface ICrudService<TModel> {
  getAll(): Observable<TModel[]>;

  getById(id: string): Observable<TModel | null>;
}
