import { Component, Input, OnInit, inject } from '@angular/core';
import { Player } from '../data/player.model';
import { Store } from '@ngrx/store';
import { getTypeColorsMapState } from '../../app-state.reducer';
import { TypeColorMap } from '../../settings/settings.model';
import { TypeColorDirective } from '../directives/type-color.directive';

@Component({
  selector: 'toma-team-item',
  templateUrl: './team-item.component.html',
  styleUrls: ['./team-item.component.scss'],
  imports: [TypeColorDirective],
})
export class TeamItemComponent implements OnInit {
  private store = inject<Store<any>>(Store);

  @Input() team: Player[];

  @Input() showDisciplines: boolean;

  @Input() showClubs = false;

  @Input() result: string;

  typeColor: string[];

  typeColors: TypeColorMap = {};

  ngOnInit() {
    this.store.select(getTypeColorsMapState).subscribe((x) => (this.typeColors = x));
  }
}
