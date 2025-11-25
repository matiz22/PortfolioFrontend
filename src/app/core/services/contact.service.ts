import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Contact} from '../models/contact';
import {catchError, map, Observable, of} from 'rxjs';
import {mapContactDto} from '../mappers/contact.dto';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = `${environment.apiUrl}/${environment.version}/send-email`;
  }

  sendEmail(contact: Contact): Observable<boolean> {
    if (contact.company && contact.company.trim().length > 0) {
      return of(true);
    }

    return this.http.post<any>(this.baseUrl, mapContactDto(contact, 'contact_form')).pipe(
      map(() => true),
      catchError(err => this.handleError(err))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<boolean> {
    return of(false);
  }
}
