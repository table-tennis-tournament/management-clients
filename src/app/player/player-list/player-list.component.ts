import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Player} from '../data/player.model';
import {PlayerType} from '../data/player.type.model';
import {Discipline} from '../../discipline/discipline.model';

@Component({
    selector: 'toma-player-list',
    templateUrl: './player-list.component.html',
    styleUrls: ['./player-list.component.scss']
})
export class PlayerListComponent {

    private _players: PlayerType[];
    get players(): PlayerType[] {
        return this._players;
    }

    values: boolean[];

    @Input('players')
    set players(players: PlayerType[]) {
        this._players = players;
        this.filteredPlayers = players;
    }

    private _disciplines: Discipline[];
    filteredDisciplines: Discipline[];

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

    filteredPlayers: PlayerType[];

    firstNameInput: string;
    clubInput: string;
    lastNameInput: string;

    constructor() {
    }

    filterPlayers(value: string, callback: (player: PlayerType) => string) {
        this.filteredPlayers = this.players
            .filter(player => this.containsValue(callback(player), value));
    }

    filterByFirstName(value: string) {
        this.filterPlayers(value, p => p.player.firstName);
    }

    private containsValue(value: string, input: string) {
        return value.toLowerCase().indexOf(input.toLowerCase()) > -1;
    }

    filterByLastName(value: string) {
        this.filterPlayers(value, p => p.player.lastName);
    }

    filterByClub(value: string) {
        this.filterPlayers(value, p => p.player.club.clubName);
    }

    onDisciplineChanged($event: number) {
        if ($event < 1) {
            this.filteredPlayers = this.players;
            return;
        }
        this.filteredPlayers = this.players.filter(pl => pl.type.id === $event);
    }

    getPaidPlayersCount() {
        return this.filteredPlayers.filter(pl => pl.paid).length;
    }

    onChange(currentPlayerType: PlayerType) {
        const newPlayer: PlayerType = Object.assign({}, currentPlayerType);
        newPlayer.paid = !currentPlayerType.paid;
        this.playerChanged.emit(newPlayer);
    }
}
