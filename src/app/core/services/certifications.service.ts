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
import {Certification} from '../models/certification';
import {CertificationSummary} from '../models/summary/certification';
import {mapCertification, mapCertificationSummary} from '../mappers/certification';
import {CertificationDto} from '../dto/certification';
import {CertificationSummaryDto} from '../dto/summary/certification';
import {ApiState} from '../models/api.state';
import {PaginationMeta} from '../models/pagination-meta';

@Injectable({
  providedIn: 'root'
})
export class CertificationsService implements ICrudService<Certification>,
  IHomeService<Certification, CertificationSummary>,
  ISummaryService<CertificationSummary>,
  ISlugService<Certification> {

  private readonly baseUrl: string;
  private readonly homeUrl: string;
  private readonly summaryUrl: string;
  private readonly entityName = 'Certification';

  private crudOps: CrudOperations<CertificationDto, Certification>;
  private homeOps: HomeOperations<CertificationDto, Certification>;
  private summaryOps: SummaryOperations<CertificationSummaryDto, CertificationSummary>;


  constructor(private http: HttpClient) {
    this.baseUrl = `${environment.apiUrl}/${environment.version}/certifications/translated`;
    this.homeUrl = `${this.baseUrl}/home-page`;
    this.summaryUrl = `${this.baseUrl}/summary`;

    this.crudOps = new CrudOperations(http, this.baseUrl, mapCertification, this.entityName);
    this.homeOps = new HomeOperations(http, this.homeUrl, mapCertification, this.entityName);
    this.summaryOps = new SummaryOperations(http, this.summaryUrl, mapCertificationSummary, this.entityName);

  }

  getAll(): Observable<ApiState<Certification[]>> {
    return this.crudOps.getAll();
  }

  getById(id: string): Observable<ApiState<Certification>> {
    return this.crudOps.getById(id);
  }

  getBySlug(slug: string): Observable<ApiState<Certification>> {
    return this.crudOps.getBySlug(slug);
  }

  getHomeItems(): Observable<ApiState<Certification[]>> {
    return this.homeOps.getHomeItems();
  }

  getHomeSummaryItems(): Observable<ApiState<CertificationSummary[]>> {
    return this.homeOps.getHomeSummaryItems(mapCertificationSummary);
  }

  getAllPaginated(page: number = 1): Observable<ApiState<{ data: Certification[], meta: PaginationMeta }>> {
    return this.crudOps.getAllPaginated(page, 9);
  }

  getAllSummary(): Observable<ApiState<CertificationSummary[]>> {
    return this.summaryOps.getAll();
  }

  getByIdSummary(id: string): Observable<ApiState<CertificationSummary>> {
    return this.summaryOps.getById(id);
  }

  getBySlugSummary(slug: string): Observable<ApiState<CertificationSummary>> {
    return this.summaryOps.getBySlug(slug);
  }

  getAllSummaryPaginated(page: number = 1): Observable<ApiState<{ data: CertificationSummary[], meta: PaginationMeta }>> {
    return this.summaryOps.getAllPaginated(page, 9);
  }

}
