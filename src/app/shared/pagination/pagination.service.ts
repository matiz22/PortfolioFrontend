import { Injectable, Signal, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiState } from '../../core/models/api.state';
import { PaginationMeta } from '../../core/models/pagination-meta';

@Injectable()
export class PaginationService {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    private readonly queryParamMap = toSignal(this.route.queryParamMap);

    /** Current page number derived from the `?page=N` query param. Defaults to 1. */
    readonly currentPage = computed(() => {
        const paramMap = this.queryParamMap();
        const pageParam = paramMap?.get('page');
        if (pageParam) {
            const page = parseInt(pageParam, 10);
            if (!isNaN(page) && page > 0) {
                return page;
            }
        }
        return 1;
    });

    /**
     * Returns a computed signal that extracts the PaginationMeta from a paginated
     * ApiState response signal. Returns `null` when not yet successful.
     */
    paginationMeta<T>(
        response: Signal<ApiState<{ data: T[]; meta: PaginationMeta }>>
    ) {
        return computed(() => {
            const r = response();
            if (r.status === 'success') {
                return r.data.meta;
            }
            return null;
        });
    }

    /**
     * Returns a computed signal with an array of page numbers [1 … lastPage]
     * derived from the pagination meta.
     */
    pageNumbers(meta: Signal<PaginationMeta | null>) {
        return computed(() => {
            const m = meta();
            if (!m) return [];
            return Array.from({ length: m.lastPage }, (_, i) => i + 1);
        });
    }

    /** Navigates to the given page by updating the `?page=N` query param. */
    goToPage(page: number): void {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { page },
            queryParamsHandling: 'merge',
        });
    }
}
