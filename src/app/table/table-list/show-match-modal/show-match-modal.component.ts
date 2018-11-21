import {Component, EventEmitter, ViewChild} from '@angular/core';
import {TableDto} from '../../tabledto.model';
import {Player} from '../../../playerview/player.model';
import {MzBaseModal, MzModalComponent} from 'ngx-materialize';

@Component({
    selector: 'toma-show-match-modal',
    templateUrl: './show-match-modal.component.html',
    styleUrls: ['./show-match-modal.component.scss']
})
export class ShowMatchModalComponent extends MzBaseModal {
    private _currentTable: TableDto;

    @ViewChild('showMatchModal') modal: MzModalComponent;

    public OnTableCalled: EventEmitter<void> = new EventEmitter<void>();

    public players: Player[];

    get currentTable(): TableDto {
        return this._currentTable;
    }

    set currentTable(value: TableDto) {
        this._currentTable = value;
        this.players = null;
        if (this.isGroupOfMatches()) {
            this.setPlayers();
        }
    }

    private isGroupOfMatches() {
        return this._currentTable.matches && this._currentTable.matches.length > 1;
    }

    setPlayers() {
        const playerArray = [];
        this._currentTable.matches.forEach(match => {
            const firstPlayer = match.team1;
            if (firstPlayer && !playerArray[firstPlayer[0].id]) {
                playerArray[firstPlayer[0].id] = match.team1[0];
            }
            const secondPlayer = match.team2;
            if (secondPlayer && !playerArray[secondPlayer[0].id]) {
                playerArray[secondPlayer[0].id] = match.team2[0];
            }
        });
        this.players = [];
        playerArray.forEach(player => {
            if (player) {
                this.players.push(player);
            }
        });
    }

    onOk() {
        this.modal.closeModal();
    }

}
