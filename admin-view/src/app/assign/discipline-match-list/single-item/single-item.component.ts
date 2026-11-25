import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Match } from '../../../shared/data/match.model';

import { TypeColorMap } from '../../../settings/settings.model';

import { TypeColorDirective } from '../../../shared/directives/type-color.directive';

import { TeamItemComponent } from '../../../shared/team-item/team-item.component';

import { DisciplineTypePipe } from '../../../shared/pipes/discipline-type.pipe';

@Component({
  selector: 'toma-single-item',
  templateUrl: './single-item.component.html',
  styleUrls: ['./single-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TypeColorDirective, TeamItemComponent, DisciplineTypePipe],
})
export class SingleItemComponent {
  constructor() {}

  @Input()
  typeColors: TypeColorMap = {};

  @Input({ required: true })
  currentMatch!: Match;
}
