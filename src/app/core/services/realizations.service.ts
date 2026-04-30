import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ICrudService } from './base/services/crud.service';
import { IHomeService } from './base/services/home.service';
import { ISummaryService } from './base/services/summary.service';
import { ISlugService } from './base/services/slug.service';
import { CrudOperations } from './base/operations/crud.operations';
import { HomeOperations } from './base/operations/home.operations';
import { SummaryOperations } from './base/operations/summary.operations';
import {Realization} from '../models/realization';
import {RealizationSummary} from '../models/summary/realization';
import {RealizationDto} from '../dto/realization';
import {RealizationSummaryDto} from '../dto/summary/realization';
import { mapRealization, mapRealizationSummary } from '../mappers/realization';
import { ApiState } from '../models/api.state';
import { PaginationMeta } from '../models/pagination-meta';

@Injectable({
  providedIn: 'root'
})
export class RealizationsService implements ICrudService<Realization>,
  IHomeService<Realization>,
  ISummaryService<RealizationSummary>,
  ISlugService<Realization> {

  private readonly baseUrl: string;
  private readonly homeUrl: string;
  private readonly summaryUrl: string;
  private readonly entityName = 'Realization';

  private crudOps: CrudOperations<RealizationDto, Realization>;
  private homeOps: HomeOperations<RealizationDto, Realization>;
  private summaryOps: SummaryOperations<RealizationSummaryDto, RealizationSummary>;


  constructor(private http: HttpClient) {
    this.baseUrl = `${environment.apiUrl}/${environment.version}/realizations/translated`;
    this.homeUrl = `${this.baseUrl}/home-page`;
    this.summaryUrl = `${this.baseUrl}/summary`;

    this.crudOps = new CrudOperations(http, this.baseUrl, mapRealization, this.entityName);
    this.homeOps = new HomeOperations(http, this.homeUrl, mapRealization, this.entityName);
    this.summaryOps = new SummaryOperations(http, this.summaryUrl, mapRealizationSummary, this.entityName);

  }

  getAll(): Observable<ApiState<Realization[]>> {
    return this.crudOps.getAll();
  }

  getById(id: string): Observable<ApiState<Realization>> {
    return this.crudOps.getById(id);
  }

  getBySlug(slug: string): Observable<ApiState<Realization>> {
    return this.crudOps.getBySlug(slug);
  }

  getHomeItems(): Observable<ApiState<Realization[]>> {
    return this.homeOps.getHomeItems();
  }

  getAllPaginated(page: number = 1): Observable<ApiState<{ data: Realization[], meta: PaginationMeta }>> {
    return this.crudOps.getAllPaginated(page, 9);
  }

  getAllSummary(): Observable<ApiState<RealizationSummary[]>> {
    return this.summaryOps.getAll();
  }

  getByIdSummary(id: string): Observable<ApiState<RealizationSummary>> {
    return this.summaryOps.getById(id);
  }

  getBySlugSummary(slug: string): Observable<ApiState<RealizationSummary>> {
    return this.summaryOps.getBySlug(slug);
  }

  getAllSummaryPaginated(page: number = 1): Observable<ApiState<{ data: RealizationSummary[], meta: PaginationMeta }>> {
    return this.summaryOps.getAllPaginated(page, 9);
  }

}
