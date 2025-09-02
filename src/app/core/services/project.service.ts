import {Injectable} from '@angular/core';
import {environment} from '../../../enviroments/enviroment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ProjectDto} from '../dto/project';
import {catchError, map, Observable, of} from 'rxjs';
import {mapProject} from '../mappers/project';
import {Project} from '../models/project';


@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private url: string = `${environment.apiUrl}/${environment.version}/projects/translated`
  private homeUrl: string = `${environment.apiUrl}/${environment.version}/projects/translated/home-page`

  constructor(private http: HttpClient) {
  }

  getHomeProjects(): Observable<Project[]> {
    return this.http.get<ProjectDto[]>(this.homeUrl).pipe(
      map(dtos => dtos.map(dto => mapProject(dto))),
      catchError(err => {
        this.handleError(err);
        return of([]);
      })
    );
  }

  getProjectById(id: string): Observable<Project | null> {
    return this.http.get<ProjectDto>(`${this.url}/${id}`).pipe(
      map(dto => mapProject(dto)),
      catchError(err => {
        this.handleError(err);
        return of(null);
      })
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Projects error', error);
  }
}
