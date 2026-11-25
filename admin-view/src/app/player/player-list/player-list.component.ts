import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { PlayerType } from '../data/player.type.model';
import { Discipline } from '../../discipline/discipline.model';
import { DisciplineSelectComponent } from '../../discipline/discipline-select/discipline-select.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow,
} from '@angular/material/table';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'toma-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    DisciplineSelectComponent,
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    MatProgressSpinner,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatCheckbox,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
  ],
})
export class PlayerListComponent {
  private _players: PlayerType[];
  private currentDisciplineFilter: number;
  private _disciplines: Discipline[];
  filteredDisciplines: Discipline[];
  paidValues: any = {};
  filteredPlayers: PlayerType[];

  firstNameInput: string;
  clubInput: string;
  lastNameInput: string;

  displayedColumns: string[] = ['id', 'firstName', 'lastName', 'club', 'discipline', 'paid'];

  get players(): PlayerType[] {
    return this._players;
  }

  @Input()
  set players(players: PlayerType[]) {
    this._players = players;
    this.paidValues = {};
    players.map((player) => {
      this.paidValues[player.id] = player.paid;
      return player;
    });
    this.applyFilters();
  }

  get disciplines(): Discipline[] {
    return this._disciplines;
  }

  @Input()
  set disciplines(disciplines: Discipline[]) {
    this._disciplines = disciplines;
    this.filteredDisciplines = disciplines.filter((dis) => dis.kind === 1);
  }

  @Input()
  playersLoading: boolean;

  @Output()
  playerChanged: EventEmitter<PlayerType> = new EventEmitter<PlayerType>();

  constructor() {}

  filterPlayers(value: string, callback: (player: PlayerType) => string) {
    this.filteredPlayers = this.filteredPlayers.filter((player) => this.containsValue(callback(player), value));
  }

  /** Applies the discipline and every name filter together. */
  applyFilters() {
    this.filteredPlayers = this.players ?? [];
    if (this.currentDisciplineFilter > 0) {
      this.filteredPlayers = this.filteredPlayers.filter((pl) => pl.type.id === this.currentDisciplineFilter);
    }
    if (this.firstNameInput) {
      this.filterByFirstName(this.firstNameInput);
    }
    if (this.lastNameInput) {
      this.filterByLastName(this.lastNameInput);
    }
    if (this.clubInput) {
      this.filterByClub(this.clubInput);
    }
  }

  filterByFirstName(value: string) {
    this.filterPlayers(value, (p) => p.player?.firstName);
  }

  filterByLastName(value: string) {
    this.filterPlayers(value, (p) => p.player?.lastName);
  }

  filterByClub(value: string) {
    this.filterPlayers(value, (p) => p.player?.club?.name);
  }

  private containsValue(value: string | undefined, input: string) {
    return (value ?? '').toLowerCase().includes(input.toLowerCase());
  }

  onDisciplineChanged(disciplineId: number) {
    this.currentDisciplineFilter = disciplineId;
    this.applyFilters();
  }

  getPaidPlayersCount() {
    return this.filteredPlayers.filter((pl) => pl.paid).length;
  }

  onChange(currentPlayerType: PlayerType) {
    const newPlayer: PlayerType = Object.assign({}, currentPlayerType);
    newPlayer.paid = this.paidValues[currentPlayerType.id];
    this.playerChanged.emit(newPlayer);
  }
}
