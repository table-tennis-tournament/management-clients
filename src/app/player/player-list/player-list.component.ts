import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PlayerType} from '../data/player.type.model';
import {Discipline} from '../../discipline/discipline.model';

@Component({
    selector: 'toma-player-list',
    templateUrl: './player-list.component.html',
    styleUrls: ['./player-list.component.scss']
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

    get players(): PlayerType[] {
        return this._players;
    }

    @Input('players')
    set players(players: PlayerType[]) {
        this._players = players;
        this.paidValues = {};
        players.map(player => {
            this.paidValues[player.id] = player.paid;
            return player;
        });
        this.applyFilters();
    }

    get disciplines(): Discipline[] {
        return this._players;
    }

    @Input('disciplines')
    set disciplines(disciplines: Discipline[]) {
        this._disciplines = disciplines;
        this.filteredDisciplines = disciplines.filter(dis => dis.kind === 1);
    }

    @Input()
    playersLoading: boolean;

    @Output()
    playerChanged: EventEmitter<PlayerType> = new EventEmitter<PlayerType>();

    constructor() {
    }

    filterPlayers(value: string, callback: (player: PlayerType) => string) {
        this.filteredPlayers = this.filteredPlayers
            .filter(player => this.containsValue(callback(player), value));
    }

    applyFilters() {
        this.filteredPlayers = this.players;
        if (this.currentDisciplineFilter > 0) {
            this.filteredPlayers = this.filteredPlayers.filter(pl => pl.type.id === this.currentDisciplineFilter);
        }
        if (this.firstNameInput) {
            this.filterByFirstName(this.firstNameInput);
            return;
        }
        if (this.lastNameInput) {
            this.filterByLastName(this.lastNameInput);
            return;
        }
        if (this.clubInput) {
            this.filterByClub(this.clubInput);
            return;
        }
    }

    filterByFirstName(value: string) {
        this.filterPlayers(value, p => p.player.firstName);
    }

    filterByLastName(value: string) {
        this.filterPlayers(value, p => p.player.lastName);
    }

    filterByClub(value: string) {
        this.filterPlayers(value, p => p.player.club.clubName);
    }

    private containsValue(value: string, input: string) {
        return value.toLowerCase().indexOf(input.toLowerCase()) > -1;
    }

    onDisciplineChanged(disciplineId: number) {
        this.currentDisciplineFilter = disciplineId;
        if (disciplineId < 1) {
            this.filteredPlayers = this.players;
            return;
        }
        this.filteredPlayers = this.players.filter(pl => pl.type.id === disciplineId);
    }

    getPaidPlayersCount() {
        return this.filteredPlayers.filter(pl => pl.paid).length;
    }

    onChange(currentPlayerType: PlayerType) {
        const newPlayer: PlayerType = Object.assign({}, currentPlayerType);
        newPlayer.paid = this.paidValues[currentPlayerType.id];
        this.playerChanged.emit(newPlayer);
    }
}
