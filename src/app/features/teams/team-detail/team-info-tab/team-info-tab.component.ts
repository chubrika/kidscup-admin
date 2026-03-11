import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Team } from '../../../../core/models/team.model';

@Component({
  selector: 'app-team-info-tab',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './team-info-tab.component.html',
  styles: [`
    .info-list { display: grid; grid-template-columns: auto 1fr; gap: 8px 24px; }
    .logo { max-width: 80px; max-height: 80px; }
  `],
})
export class TeamInfoTabComponent {
  readonly team = input.required<Team>();
}
