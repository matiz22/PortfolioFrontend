import { isPlatformServer } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, LOCALE_ID, makeStateKey, PLATFORM_ID, TransferState } from '@angular/core';
import { catchError, defer, map, Observable, of } from 'rxjs';
import { ApiState } from '../../../models/api.state';

export class HomeOperations<TDto, TModel> {
  private readonly transferState = inject(TransferState);
  private readonly locale = inject(LOCALE_ID);
  private readonly onServer = isPlatformServer(inject(PLATFORM_ID));

  constructor(
    private http: HttpClient,
    private homeUrl: string,
    private mapper: (dto: TDto) => TModel,
    private entityName: string = 'Entity'
  ) {
  }

  getHomeItems(): Observable<ApiState<TModel[]>> {
    return this.http.get<TDto[]>(this.homeUrl).pipe(
      map(dtos => ApiState.success(dtos.map(dto => this.mapper(dto)))),
      catchError(err => of(ApiState.error<TModel[]>(this.getErrorMessage(err))))
    );
  }

  getHomeSummaryItems<TSummaryDto, TSummaryModel>(
    mapper: (dto: TSummaryDto) => TSummaryModel,
  ): Observable<ApiState<TSummaryModel[]>> {
    const url = `${this.homeUrl}/summary`;
    const key = makeStateKey<TSummaryDto[]>(`home-summary:${this.locale}:${url}`);
    return defer(() => {
      // Deferred chapters can hydrate after Angular's HTTP transfer cache is off.
      if (!this.onServer && this.transferState.hasKey(key)) {
        const dtos = this.transferState.get(key, []);
        this.transferState.remove(key);
        return of(dtos);
      }
      return this.http.get<TSummaryDto[]>(url, { transferCache: false });
    }).pipe(
      map(dtos => {
        const summaries = dtos.map(dto => mapper(dto));
        if (this.onServer) {
          // Keep JSON DTOs in the snapshot; mapping reconstructs dates on both platforms.
          this.transferState.set(key, dtos);
        }
        return ApiState.success(summaries);
      }),
      catchError(err => of(ApiState.error<TSummaryModel[]>(this.getErrorMessage(err))))
    );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    return error.error?.message || `Failed to load ${this.entityName.toLowerCase()}.`;
  }
}
