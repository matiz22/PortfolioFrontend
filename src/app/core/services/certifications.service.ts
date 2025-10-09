import {Injectable} from '@angular/core';
import {ICrudService} from './base/services/crud.service';
import {IHomeService} from './base/services/home.service';
import {CrudOperations} from './base/operations/crud.operations';
import {HomeOperations} from './base/operations/home.operations';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {Certification} from '../models/certification';
import {mapCertification} from '../mappers/certification';
import {CertificationDto} from '../dto/certification';
import {ApiState} from '../models/api.state';

@Injectable({
  providedIn: 'root'
})
export class CertificationsService implements ICrudService<Certification>,
  IHomeService<Certification> {

  private readonly baseUrl: string;
  private readonly homeUrl: string;
  private readonly entityName = 'Certification';

  private crudOps: CrudOperations<CertificationDto, Certification>;
  private homeOps: HomeOperations<CertificationDto, Certification>;


  constructor(private http: HttpClient) {
    this.baseUrl = `${environment.apiUrl}/${environment.version}/certifications/translated`;
    this.homeUrl = `${this.baseUrl}/home-page`;

    this.crudOps = new CrudOperations(http, this.baseUrl, mapCertification, this.entityName);
    this.homeOps = new HomeOperations(http, this.homeUrl, mapCertification, this.entityName);

  }

  getAll(): Observable<ApiState<Certification[]>> {
    return this.crudOps.getAll();
  }

  getById(id: string): Observable<ApiState<Certification>> {
    return this.crudOps.getById(id);
  }

  getHomeItems(): Observable<ApiState<Certification[]>> {
    return this.homeOps.getHomeItems();
  }

}
