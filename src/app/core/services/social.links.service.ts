import {Injectable} from '@angular/core';
import {ICrudService} from './base/services/crud.service';
import {CrudOperations} from './base/operations/crud.operations';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../enviroments/enviroment';
import {Observable} from 'rxjs';
import {SocialLink} from '../models/social.link';
import {SocialLinkDto} from '../dto/social.link';
import {mapSocialLink} from '../mappers/social.link';
import {ApiState} from '../models/api.state';

@Injectable({
  providedIn: 'root'
})
export class SocialLinksService implements ICrudService<SocialLink> {

  private readonly baseUrl: string;
  private readonly entityName = 'SocialLink';

  private crudOps: CrudOperations<SocialLinkDto, SocialLink>;


  constructor(private http: HttpClient) {
    this.baseUrl = `${environment.apiUrl}/${environment.version}/social-links/translated`;

    this.crudOps = new CrudOperations(http, this.baseUrl, mapSocialLink, this.entityName);

  }

  getAll(): Observable<ApiState<SocialLink[]>> {
    return this.crudOps.getAll();
  }

  getById(id: string): Observable<ApiState<SocialLink>> {
    return this.crudOps.getById(id);
  }

}
