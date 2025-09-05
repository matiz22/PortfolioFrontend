import {Observable} from 'rxjs';

export interface IHomeService<TModel> {
  getHomeItems(): Observable<TModel[]>;
}
