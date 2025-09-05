import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-section-texts',
  imports: [],
  templateUrl: './section-texts.html',
  styleUrl: './section-texts.scss'
})
export class SectionTexts {
  @Input() title!: string;
  @Input() subtitle!: string;
}
