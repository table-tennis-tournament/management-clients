import {Component, Input} from '@angular/core';
import {Player} from '../player.model';

@Component({
    selector: 'toma-player-list',
    templateUrl: './player-list.component.html',
    styleUrls: ['./player-list.component.scss']
})
export class PlayerListComponent {

    _players: Player[];

    get players(): Player[] {
        return this._players;
    }

    @Input('players')
    set players(players: Player[]) {
        this._players = players;
        this.filteredPlayers = players;
    }

    filteredPlayers: Player[];

    @Input()
    playersLoading: boolean;

    firstNameInput: string;
    clubInput: string;
    lastNameInput: string;

    constructor() {
    }

    filterPlayers(value: string, callback: (player: Player) => string) {
        this.filteredPlayers = this.players
            .filter(player => this.containsValue(callback(player), value));
    }

    filterByFirstName(value: string) {
        this.filterPlayers(value, p => p.firstName);
    }

    private containsValue(value: string, input: string) {
        return value.toLowerCase().indexOf(input.toLowerCase()) > -1;
    }

    filterByLastName(value: string) {
        this.filterPlayers(value, p => p.lastName);
    }

    filterByClub(value: string) {
        this.filterPlayers(value, p => p.club.clubName);
    }
}
