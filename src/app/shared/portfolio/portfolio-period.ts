import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

interface PeriodDates {
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
}

@Component({
  selector: 'app-portfolio-period',
  imports: [DatePipe],
  template: `
    @let dates = period();
    <time [attr.datetime]="dates.startDate | date:'yyyy-MM-dd':'UTC'">{{ dates.startDate | date:format():'UTC' }}</time>
    @if (dates.isCurrent || dates.endDate) {
      <span aria-hidden="true">—</span>
      @if (dates.isCurrent) {
        <span i18n="@@portfolio.present">Present</span>
      } @else {
        <time [attr.datetime]="dates.endDate | date:'yyyy-MM-dd':'UTC'">{{ dates.endDate | date:format():'UTC' }}</time>
      }
    }
  `,
  styles: ':host { display: inline-flex; align-items: baseline; flex-wrap: wrap; gap: 0.45em; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioPeriod {
  readonly period = input.required<PeriodDates>();
  readonly format = input('yyyy');
}
