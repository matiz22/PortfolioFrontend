import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {ProjectDto} from '../dto/project';
import {Observable} from 'rxjs';
import {mapProject} from '../mappers/project';
import {Project} from '../models/project';
import {HomeOperations} from './base/operations/home.operations';
import {CrudOperations} from './base/operations/crud.operations';
import {IHomeService} from './base/services/home.service';
import {ICrudService} from './base/services/crud.service';
import {ApiState} from '../models/api.state';


@Injectable({
  providedIn: 'root'
})
export class ProjectsService implements ICrudService<Project>,
  IHomeService<Project> {

  private readonly baseUrl: string;
  private readonly homeUrl: string;
  private readonly entityName = 'Project';

  private crudOps: CrudOperations<ProjectDto, Project>;
  private homeOps: HomeOperations<ProjectDto, Project>;


  constructor(private http: HttpClient) {
    this.baseUrl = `${environment.apiUrl}/${environment.version}/projects/translated`;
    this.homeUrl = `${this.baseUrl}/home-page`;

    this.crudOps = new CrudOperations(http, this.baseUrl, mapProject, this.entityName);
    this.homeOps = new HomeOperations(http, this.homeUrl, mapProject, this.entityName);

  }

  getAll(): Observable<ApiState<Project[]>> {
    return this.crudOps.getAll();
  }

  getById(id: string): Observable<ApiState<Project>> {
    return this.crudOps.getById(id);
  }

  getHomeItems(): Observable<ApiState<Project[]>> {
    return this.homeOps.getHomeItems();
  }
}
