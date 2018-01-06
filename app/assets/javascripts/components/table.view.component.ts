import {Component, ViewContainerRef, ViewEncapsulation, ViewChild, Output, EventEmitter, Input, OnDestroy} from "@angular/core"
import {MatchService} from "../services/match.service"
import {TableService} from "../services/table.service"
import {MatchToStringService} from "../services/match.toString.service"
import {RandomMatchService} from "../services/random.match.service"
import {ResultModalComponent} from "./result.modal.view.component"

import {Table} from "../data/table"
import {TableDto} from "../data/table.dto"
import {MatchListDto} from "../data/match.list.dto"
import {MatchDto} from "../data/match.dto"
import {Match} from "../data/match"
import {ResultEvent} from "../handler/result.event"
import { SelectMatchModalComponent } from "../components/table/table.select.match.modal.component";
import { AssignEvent } from "../handler/assign.event";
import { ToastService } from "../services/toast.service";
import { ModalSelectTableComponent } from "./modals/select.table.modal";
import { WebSocketService } from "../services/web.socket.service";
import { ModalShowMatchComponent } from "./modals/show.match.modal";
import { ShowMatchEvent } from "../handler/show.match.event";
import { ActivatedRoute } from "@angular/router"
import { MatchListService } from "../services/match.list.service";
import { StatusDto } from "app/assets/javascripts/data/status.dto";


@Component({
  templateUrl:"assets/javascripts/views/table.view.component.html",
  selector: "table-view-component"
})
export class TableViewComponent implements OnDestroy {
    
    currentSubscription: any;
    
    public tables: TableDto[];
    public rowCount: number[];
    public currentTablesToCall: any[];
    private isShowMatchOpen: boolean;

    @ViewChild(ResultModalComponent) resultDialog: ResultModalComponent;
    
    @ViewChild(SelectMatchModalComponent) selectMatch: SelectMatchModalComponent;

    @ViewChild(ModalSelectTableComponent) selectTable: ModalSelectTableComponent;

    @ViewChild(ModalShowMatchComponent) showMatch: ModalShowMatchComponent;

    @Output() onTableAssigned = new EventEmitter<AssignEvent>();

    _showMatches: boolean;
    get showMatches(): boolean {
        return this._showMatches;
    }

    @Input("showMatches")
    set showMatches(value: boolean){
        this._showMatches = value;
        if(this.showMatches !== false && !this.currentSubscription){
            this.currentTablesToCall = [];
            this.currentSubscription = this.websocketService.OnMatchToTable.subscribe(this.onMatchToTable.bind(this));
        }
    } 


    constructor(route: ActivatedRoute, private matchService:MatchService, 
        private tableService:TableService, 
        public matchToStringService: MatchToStringService, 
        private randomMatchService: RandomMatchService,
        private toastService: ToastService,
        private matchListService: MatchListService,
        private websocketService: WebSocketService) {

        if(route.snapshot.data[0]){
            this.showMatches = route.snapshot.data[0]['showMatches'];
        }
        this.loadAllTables();
        
        this.tableService.OnTableChanged.subscribe(
            this.handleMatchChanged.bind(this)
        );
        this.websocketService.OnTableRefresh.subscribe(this.onTableRefresh.bind(this));
       
    }

    ngOnDestroy(): void {
        if(this.currentSubscription){
            this.currentSubscription.unsubscribe();
            this.currentSubscription = null;
        }
    }

    onMatchToTable(data: any){
        if(!data || !data.id){
            return;
        }
        this.currentTablesToCall.push(data.id);
        this.checkTableToCall();
    }

    checkTableToCall(){
        if(this.currentTablesToCall.length < 1){
            return;
        }
        var nextTableNumber = this.currentTablesToCall[0];
        var showMatchEvent = new ShowMatchEvent();
        showMatchEvent.tableId = nextTableNumber;
        this.showMatch.showMatch(showMatchEvent);
    }

    onShowMatchClosed(tableNumber:any){
        var index = this.currentTablesToCall.indexOf(tableNumber);
        this.currentTablesToCall.splice(index, 1);
        this.checkTableToCall();
    }

    loadAllTables(){
        this.tableService.getAllTables().subscribe(this.getAllTablesSuccessful.bind(this), this.getAllTablesFailed)
    }

    getAllTablesSuccessful(tables: TableDto[]){
        this.tables = tables;
        this.rowCount = Array.from(Array(Math.ceil(this.tables.length / 5)).keys());
        this.toastService.toastSuccess();
    }

    onTableAssignedHandler($event: AssignEvent){
        this.onTableAssigned.emit($event);
    }

    onTableRefresh(){
        this.loadAllTables();
    }

    onSyncWaitingList(){
        this.matchListService.autoStart().subscribe(this.onWaitingListSyncSuccess.bind(this));
    }

    onWaitingListSyncSuccess(status: StatusDto){
        this.toastService.toastMessageOrShowStatus(status, "Autostart");
    }

    getAllTablesFailed(error){
        console.log(error);
    }

    handleMatchChanged(match: MatchListDto[]){
        this.loadAllTables();
    }

    onResultForMatch(resultEvent: ResultEvent){
        this.resultDialog.setResultHandler(resultEvent.handler);
        this.resultDialog.setMatch(resultEvent.match);
        this.resultDialog.openModal();
    }
}