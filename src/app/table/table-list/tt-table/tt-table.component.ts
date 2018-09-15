import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TableDto} from '../../tabledto.model';

@Component({
    selector: 'toma-tt-table',
    templateUrl: './tt-table.component.html',
    styleUrls: ['./tt-table.component.scss']
})
export class TtTableComponent {

    public bgColor = 'blue';

    @Output()
    resultForMatch = new EventEmitter<any>();

    @Output()
    tableAssigned = new EventEmitter<any>();

    @Output()
    selectMatch = new EventEmitter<any>();

    @Output()
    selectTable = new EventEmitter<any>();

    @Output()
    lockTable = new EventEmitter<number>();

    @Output()
    unLockTable = new EventEmitter<number>();

    @Output()
    freeTable = new EventEmitter<number>();

    _table: TableDto;

    get table(): TableDto {
        return this._table;
    }

    @Input('table')
    set table(value: TableDto) {
        this._table = value;
    }

    isSingleMatch() {
        return this.table.matchinfo != null && this.table.matchinfo.length === 1;
    }

    onResult() {
        if (this.isSingleMatch()) {
            // var resultEvent = new ResultEvent();
            // resultEvent.handler = this;
            // resultEvent.match = this.table.matchinfo[0];
            // this.onResultForMatch.emit(resultEvent);
        }
    }

    onLock() {
        // this.tableService.lockTable(this.table.table.id).subscribe(this.lockTableAfterRequestSuccessfull.bind(this), this.handleErrorsOnService.bind(this));
    }

    onUnLock() {
        // this.tableService.unlockTable(this.table.table.id).subscribe(this.unLockTableAfterRequestSuccessful.bind(this), this.handleErrorsOnService.bind(this));
    }

    onFree() {
        // if(this.isSingleMatch()){
        //   var matchId = this.table.matchinfo[0].match.id;
        //   this.tableService.freeTable([matchId]).subscribe(this.freeTableAfterRequestSuccessfull.bind(this), this.handleErrorsOnService.bind(this));
        //   return;
        // }
        // this.fireSelectMatchEvent(new FreeMatchHandler(this.tableService))
    }

    onTakeBack() {
        // if(this.isSingleMatch()){
        //   var matchId = this.table.matchinfo[0].match.id;
        //   this.tableService.takeBackTable([matchId]).subscribe(this.takeBackTableAfterRequestSuccessful.bind(this), this.handleErrorsOnService.bind(this));
        //   return;
        // }
        // this.fireSelectMatchEvent(new TakeBackMatchHandler(this.tableService))
    }

    onPrint() {
        // if(this.isSingleMatch()){
        //   var matchId = this.table.matchinfo[0].match.id;
        //   this.tableService.printMatch(this.table.matchinfo[0].match.id).subscribe(
        //     this.onPrinted.bind(this),
        //     this.handleErrorsOnService.bind(this));
        //   return;
        // }
        // this.fireSelectMatchEvent(new PrintMatchHandler(this.tableService, this.toastService))

    }

    onAssignToSecondTable() {
        // var selectEvent = new SelectTableEvent();
        // selectEvent.handler = new AssignSecondTableHandler(this.matchService);
        // selectEvent.handler.onRefresh.subscribe(this.onTableRefresh.bind(this));
        // selectEvent.matches = this._table.matchinfo;
        // this.onSelectTable.emit(selectEvent);
    }


}
