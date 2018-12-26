import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {DisciplineGroup} from '../models/discipline.group.model';
import {MzCollapsibleComponent} from 'ngx-materialize';
import {Match} from '../../../shared/data/match.model';
import {MatchState} from '../../../shared/data/matchstate.model';

@Component({
    selector: 'toma-discipline-group',
    templateUrl: './discipline-group.component.html',
    styleUrls: ['./discipline-group.component.scss']
})
export class DisciplineGroupComponent {
    openMatches: number;
    isComplete: boolean;
    allMatchCount: number;
    openMatchState: string = MatchState[MatchState.Open];
    tableNumbers: any[];

    @ViewChild('collapsibleGroup') collapsibleGroup: MzCollapsibleComponent;

    @Input()
    typeColor: string[];

    @Output()
    resultForMatch: EventEmitter<Match> = new EventEmitter<Match>();

    _showPlayers: boolean;
    _showMatches: boolean;

    @Input('showMatches')
    set showMatches(value: boolean) {
        this._showMatches = value;
        this.openCloseByIndex(value, 1);
    }

    get showMatches(): boolean {
        return this._showMatches;
    }

    @Input('showPlayers')
    set showPlayers(value: boolean) {
        this._showPlayers = value;
        this.openCloseByIndex(value, 0);
    }

    get showPlayers(): boolean {
        return this._showPlayers;
    }

    _group: DisciplineGroup;
    get group(): DisciplineGroup {
        return this._group;
    }

    @Input('group')
    set group(value: DisciplineGroup) {
        this._group = value;
        this.calculateOpenMatches();
        this.setTables();
    }

    calculateOpenMatches() {
        this.openMatches = 0;
        this.isComplete = true;
        this._group.matches.forEach(element => {
            if (element.isPlayed !== true) {
                this.openMatches++;
            }
        });
        this.allMatchCount = this._group.matches.length;
    }

    setTables() {
        const numberArray = [];
        this.group.matches.forEach(element => {
            element.table.forEach(tableNumber => {
                if (numberArray.indexOf(tableNumber) < 0) {
                    numberArray.push(tableNumber);
                }
            });
        });
        this.tableNumbers = numberArray;
    }

    openCloseByIndex(value: boolean, index: number) {
        if (value === true) {
            this.collapsibleGroup.open(index);
            return;
        }
        this.collapsibleGroup.close(index);
    }

    isGroupPlayable() {
        const playableMatches = this.group.matches.filter(match => match.isPlayable === false);
        return playableMatches.length === 0;
    }

    isGroupInWaitingList() {
        const playableMatches = this.group.matches.filter(match => match.state === MatchState[MatchState.InWaitingList]);
        return playableMatches.length === this.group.matches.length;
    }

    groupIsNotPlayable() {
        return !this.group.isComplete && !this.isGroupPlayable() && this.tableNumbers.length < 1;
    }

}
