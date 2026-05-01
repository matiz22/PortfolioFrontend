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
import {Education} from '../models/education';
import {EducationSummary} from '../models/summary/education';
import {EducationDto} from '../dto/education';
import {EducationSummaryDto} from '../dto/summary/education';
import {mapEducation, mapEducationSummary} from '../mappers/education';
import {ApiState} from '../models/api.state';
import {PaginationMeta} from '../models/pagination-meta';

@Injectable({
  providedIn: 'root'
})
export class EducationService implements ICrudService<Education>,
  IHomeService<Education, EducationSummary>,
  ISummaryService<EducationSummary>,
  ISlugService<Education> {

  private readonly baseUrl: string;
  private readonly homeUrl: string;
  private readonly summaryUrl: string;
  private readonly entityName = 'Education';

  private crudOps: CrudOperations<EducationDto, Education>;
  private homeOps: HomeOperations<EducationDto, Education>;
  private summaryOps: SummaryOperations<EducationSummaryDto, EducationSummary>;


  constructor(private http: HttpClient) {
    this.baseUrl = `${environment.apiUrl}/${environment.version}/education/translated`;
    this.homeUrl = `${this.baseUrl}/home-page`;
    this.summaryUrl = `${this.baseUrl}/summary`;

    this.crudOps = new CrudOperations(http, this.baseUrl, mapEducation, this.entityName);
    this.homeOps = new HomeOperations(http, this.homeUrl, mapEducation, this.entityName);
    this.summaryOps = new SummaryOperations(http, this.summaryUrl, mapEducationSummary, this.entityName);

  }

  getAll(): Observable<ApiState<Education[]>> {
    return this.crudOps.getAll();
  }

  getById(id: string): Observable<ApiState<Education>> {
    return this.crudOps.getById(id);
  }

  getBySlug(slug: string): Observable<ApiState<Education>> {
    return this.crudOps.getBySlug(slug);
  }

  getHomeItems(): Observable<ApiState<Education[]>> {
    return this.homeOps.getHomeItems();
  }

  getHomeSummaryItems(): Observable<ApiState<EducationSummary[]>> {
    return this.homeOps.getHomeSummaryItems(mapEducationSummary);
  }

  getAllPaginated(page: number = 1): Observable<ApiState<{ data: Education[], meta: PaginationMeta }>> {
    return this.crudOps.getAllPaginated(page, 9);
  }

  getAllSummary(): Observable<ApiState<EducationSummary[]>> {
    return this.summaryOps.getAll();
  }

  getByIdSummary(id: string): Observable<ApiState<EducationSummary>> {
    return this.summaryOps.getById(id);
  }

  getBySlugSummary(slug: string): Observable<ApiState<EducationSummary>> {
    return this.summaryOps.getBySlug(slug);
  }

  getAllSummaryPaginated(page: number = 1): Observable<ApiState<{ data: EducationSummary[], meta: PaginationMeta }>> {
    return this.summaryOps.getAllPaginated(page, 9);
  }

}

