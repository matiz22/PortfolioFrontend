import {Injectable} from '@angular/core';
import {ICrudService} from './base/services/crud.service';
import {IHomeService} from './base/services/home.service';
import {CrudOperations} from './base/operations/crud.operations';
import {HomeOperations} from './base/operations/home.operations';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../enviroments/enviroment';
import {Observable} from 'rxjs';
import {Job} from '../models/job';
import {mapJob} from '../mappers/job';
import {JobDto} from '../dto/job';
import {ApiState} from '../models/api.state';

@Injectable({
  providedIn: 'root'
})
export class JobsService implements ICrudService<Job>,
  IHomeService<Job> {

  private readonly baseUrl: string;
  private readonly homeUrl: string;
  private readonly entityName = 'Job';

  private crudOps: CrudOperations<JobDto, Job>;
  private homeOps: HomeOperations<JobDto, Job>;


  constructor(private http: HttpClient) {
    this.baseUrl = `${environment.apiUrl}/${environment.version}/jobs/translated`;
    this.homeUrl = `${this.baseUrl}/home-page`;

    this.crudOps = new CrudOperations(http, this.baseUrl, mapJob, this.entityName);
    this.homeOps = new HomeOperations(http, this.homeUrl, mapJob, this.entityName);

  }

  getAll(): Observable<ApiState<Job[]>> {
    return this.crudOps.getAll();
  }

  getById(id: string): Observable<ApiState<Job>> {
    return this.crudOps.getById(id);
  }

  getHomeItems(): Observable<ApiState<Job[]>> {
    return this.homeOps.getHomeItems();
  }

}
