import {Injectable} from '@angular/core';
import {ICrudService} from './base/services/crud.service';
import {IHomeService} from './base/services/home.service';
import {CrudOperations} from './base/operations/crud.operations';
import {HomeOperations} from './base/operations/home.operations';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../enviroments/enviroment';
import {Observable} from 'rxjs';
import {Education} from '../models/education';
import {EducationDto} from '../dto/education';
import {mapEducation} from '../mappers/education';
import {ApiState} from '../models/api.state';

@Injectable({
  providedIn: 'root'
})
export class EducationService implements ICrudService<Education>,
  IHomeService<Education> {

  private readonly baseUrl: string;
  private readonly homeUrl: string;
  private readonly entityName = 'Education';

  private crudOps: CrudOperations<EducationDto, Education>;
  private homeOps: HomeOperations<EducationDto, Education>;


  constructor(private http: HttpClient) {
    this.baseUrl = `${environment.apiUrl}/${environment.version}/education/translated`;
    this.homeUrl = `${this.baseUrl}/home-page`;

    this.crudOps = new CrudOperations(http, this.baseUrl, mapEducation, this.entityName);
    this.homeOps = new HomeOperations(http, this.homeUrl, mapEducation, this.entityName);

  }

  getAll(): Observable<ApiState<Education[]>> {
    return this.crudOps.getAll();
  }

  getById(id: string): Observable<ApiState<Education>> {
    return this.crudOps.getById(id);
  }

  getHomeItems(): Observable<ApiState<Education[]>> {
    return this.homeOps.getHomeItems();
  }

}

