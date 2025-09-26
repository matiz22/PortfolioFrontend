import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../enviroments/enviroment';
import {HttpClient} from '@angular/common/http';
import {ICrudService} from './base/services/crud.service';
import {IHomeService} from './base/services/home.service';
import {CrudOperations} from './base/operations/crud.operations';
import {HomeOperations} from './base/operations/home.operations';
import {Realization} from '../models/realization';
import {RealizationDto} from '../dto/realization';
import {mapRealization} from '../mappers/realization';
import {ApiState} from '../models/api.state';

@Injectable({
  providedIn: 'root'
})
export class RealizationsService implements ICrudService<Realization>,
  IHomeService<Realization> {

  private readonly baseUrl: string;
  private readonly homeUrl: string;
  private readonly entityName = 'Realization';

  private crudOps: CrudOperations<RealizationDto, Realization>;
  private homeOps: HomeOperations<RealizationDto, Realization>;


  constructor(private http: HttpClient) {
    this.baseUrl = `${environment.apiUrl}/${environment.version}/realizations/translated`;
    this.homeUrl = `${this.baseUrl}/home-page`;

    this.crudOps = new CrudOperations(http, this.baseUrl, mapRealization, this.entityName);
    this.homeOps = new HomeOperations(http, this.homeUrl, mapRealization, this.entityName);

  }

  getAll(): Observable<ApiState<Realization[]>> {
    return this.crudOps.getAll();
  }

  getById(id: string): Observable<ApiState<Realization>> {
    return this.crudOps.getById(id);
  }

  getHomeItems(): Observable<ApiState<Realization[]>> {
    return this.homeOps.getHomeItems();
  }

}
