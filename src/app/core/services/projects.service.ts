import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {ProjectDto} from '../dto/project';
import {ProjectSummaryDto} from '../dto/summary/project';
import {Observable} from 'rxjs';
import {mapProject, mapProjectSummary} from '../mappers/project';
import {Project} from '../models/project';
import {ProjectSummary} from '../models/summary/project';
import {HomeOperations} from './base/operations/home.operations';
import {CrudOperations} from './base/operations/crud.operations';
import {SummaryOperations} from './base/operations/summary.operations';
import {IHomeService} from './base/services/home.service';
import {ICrudService} from './base/services/crud.service';
import {ISummaryService} from './base/services/summary.service';
import {ISlugService} from './base/services/slug.service';
import {ApiState} from '../models/api.state';
import {PaginationMeta} from '../models/pagination-meta';


@Injectable({
  providedIn: 'root'
})
export class ProjectsService implements ICrudService<Project>,
  IHomeService<Project>,
  ISummaryService<ProjectSummary>,
  ISlugService<Project> {

  private readonly baseUrl: string;
  private readonly homeUrl: string;
  private readonly summaryUrl: string;
  private readonly entityName = 'Project';

  private crudOps: CrudOperations<ProjectDto, Project>;
  private homeOps: HomeOperations<ProjectDto, Project>;
  private summaryOps: SummaryOperations<ProjectSummaryDto, ProjectSummary>;


  constructor(private http: HttpClient) {
    this.baseUrl = `${environment.apiUrl}/${environment.version}/projects/translated`;
    this.homeUrl = `${this.baseUrl}/home-page`;
    this.summaryUrl = `${this.baseUrl}/summary`;

    this.crudOps = new CrudOperations(http, this.baseUrl, mapProject, this.entityName);
    this.homeOps = new HomeOperations(http, this.homeUrl, mapProject, this.entityName);
    this.summaryOps = new SummaryOperations(http, this.summaryUrl, mapProjectSummary, this.entityName);

  }

  getAll(): Observable<ApiState<Project[]>> {
    return this.crudOps.getAll();
  }

  getById(id: string): Observable<ApiState<Project>> {
    return this.crudOps.getById(id);
  }

  getBySlug(slug: string): Observable<ApiState<Project>> {
    return this.crudOps.getBySlug(slug);
  }

  getHomeItems(): Observable<ApiState<Project[]>> {
    return this.homeOps.getHomeItems();
  }

  getAllPaginated(page: number = 1): Observable<ApiState<{ data: Project[], meta: PaginationMeta }>> {
    return this.crudOps.getAllPaginated(page, 9);
  }

  getAllSummary(): Observable<ApiState<ProjectSummary[]>> {
    return this.summaryOps.getAll();
  }

  getByIdSummary(id: string): Observable<ApiState<ProjectSummary>> {
    return this.summaryOps.getById(id);
  }

  getBySlugSummary(slug: string): Observable<ApiState<ProjectSummary>> {
    return this.summaryOps.getBySlug(slug);
  }

  getAllSummaryPaginated(page: number = 1): Observable<ApiState<{ data: ProjectSummary[], meta: PaginationMeta }>> {
    return this.summaryOps.getAllPaginated(page, 9);
  }
}
