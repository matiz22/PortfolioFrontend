import { Component, input } from '@angular/core';
import { Skill } from '../../../core/models/skill';

@Component({
  selector: 'app-skills-details-section',
  imports: [],
  templateUrl: './skills-details-section.html',
  styleUrl: './skills-details-section.scss',
})
export class SkillsDetailsSection {
  skills = input<Skill[]>([]);
  title = input<string>($localize`:@@skills.section.title:Skills`);
}
