import {Injectable} from '@angular/core';
import {ICrudService} from './base/services/crud.service';
import {IHomeService} from './base/services/home.service';
import {ISummaryService} from './base/services/summary.service';
import {ISlugService} from './base/services/slug.service';
import {CrudOperations} from './base/operations/crud.operations';
import {HomeOperations} from './base/operations/home.operations';
import {SummaryOperations} from './base/operations/summary.operations';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {Job} from '../models/job';
import {JobSummary} from '../models/summary/job';
import {mapJob, mapJobSummary} from '../mappers/job';
import {JobDto} from '../dto/job';
import {JobSummaryDto} from '../dto/summary/job';
import {ApiState} from '../models/api.state';
import {PaginationMeta} from '../models/pagination-meta';

@Injectable({
  providedIn: 'root'
})
export class JobsService implements ICrudService<Job>,
  IHomeService<Job, JobSummary>,
  ISummaryService<JobSummary>,
  ISlugService<Job> {

  private readonly baseUrl: string;
  private readonly homeUrl: string;
  private readonly summaryUrl: string;
  private readonly entityName = 'Job';

  private crudOps: CrudOperations<JobDto, Job>;
  private homeOps: HomeOperations<JobDto, Job>;
  private summaryOps: SummaryOperations<JobSummaryDto, JobSummary>;


  constructor(private http: HttpClient) {
    this.baseUrl = `${environment.apiUrl}/${environment.version}/jobs/translated`;
    this.homeUrl = `${this.baseUrl}/home-page`;
    this.summaryUrl = `${this.baseUrl}/summary`;

    this.crudOps = new CrudOperations(http, this.baseUrl, mapJob, this.entityName);
    this.homeOps = new HomeOperations(http, this.homeUrl, mapJob, this.entityName);
    this.summaryOps = new SummaryOperations(http, this.summaryUrl, mapJobSummary, this.entityName);

  }

  getAll(): Observable<ApiState<Job[]>> {
    return this.crudOps.getAll();
  }

  getById(id: string): Observable<ApiState<Job>> {
    return this.crudOps.getById(id);
  }

  getBySlug(slug: string): Observable<ApiState<Job>> {
    return this.crudOps.getBySlug(slug);
  }

  getHomeItems(): Observable<ApiState<Job[]>> {
    return this.homeOps.getHomeItems();
  }

  getHomeSummaryItems(): Observable<ApiState<JobSummary[]>> {
    return this.homeOps.getHomeSummaryItems(mapJobSummary);
  }

  getAllPaginated(page: number = 1): Observable<ApiState<{ data: Job[], meta: PaginationMeta }>> {
    return this.crudOps.getAllPaginated(page, 9);
  }

  getAllSummary(): Observable<ApiState<JobSummary[]>> {
    return this.summaryOps.getAll();
  }

  getByIdSummary(id: string): Observable<ApiState<JobSummary>> {
    return this.summaryOps.getById(id);
  }

  getBySlugSummary(slug: string): Observable<ApiState<JobSummary>> {
    return this.summaryOps.getBySlug(slug);
  }

  getAllSummaryPaginated(page: number = 1): Observable<ApiState<{ data: JobSummary[], meta: PaginationMeta }>> {
    return this.summaryOps.getAllPaginated(page, 9);
  }

}
