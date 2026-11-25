import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'div[appHomeStage], section[appHomeStage]',
  template: '<ng-content />',
  // Attribute selectors apply the shared layout to the existing projected DOM.
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './home-stage.scss',
})
export class HomeStage {}
