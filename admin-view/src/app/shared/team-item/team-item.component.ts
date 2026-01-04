import { Component, Input, OnInit } from '@angular/core';
import { Player } from '../data/player.model';
import { Store } from '@ngrx/store';
import { getTypeColorsState } from '../../app-state.reducer';

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

  typeColor: string[];

  constructor(private store: Store<any>) {}

  ngOnInit() {
    this.store.select(getTypeColorsState).subscribe((x) => (this.typeColor = x));
  }
}
