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

    private currentTable: TableDto;

    @ViewChild('showMatchModal') modal: MzModalComponent;

    public OnTableCalled: EventEmitter<void> = new EventEmitter<void>();
    public players: Player[];

    setTable(table: TableDto) {
        this.currentTable = table;
        this.players = null;
        if (this.currentTable.matches && this.currentTable.matches.length > 1) {
            this.setPlayers();
        }
    }

    setPlayers() {
        const playerArray = [];
        this.currentTable.matches.forEach(match => {
            if (match.team1 && !playerArray[match.team1[0].id]) {
                playerArray[match.team1[0].id] = match.team1[0];
            }
            if (match.team2 && !playerArray[match.team2[0].id]) {
                playerArray[match.team2[0].id] = match.team2[0];
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
