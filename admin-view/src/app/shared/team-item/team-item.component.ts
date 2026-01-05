import { Component, Input, OnInit } from '@angular/core';
import { Player } from '../data/player.model';
import { Store } from '@ngrx/store';
import { getTypeColorsMapState } from '../../app-state.reducer';
import { TypeColorMap } from '../../settings/settings.model';

@Component({
  selector: 'toma-team-item',
  templateUrl: './team-item.component.html',
  styleUrls: ['./team-item.component.scss'],
  standalone: false,
})
export class TeamItemComponent implements OnInit {
  @Input() team: Player[];

  @Input() showDisciplines: boolean;

  @Input() showClubs = false;

  typeColors: TypeColorMap = {};

  constructor(private store: Store<any>) {}

  ngOnInit() {
    this.store.select(getTypeColorsMapState).subscribe((x) => (this.typeColors = x));
  }
}
