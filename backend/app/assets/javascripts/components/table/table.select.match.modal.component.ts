import {Component, EventEmitter} from "@angular/core";
import {MatchToStringService} from "../../services/match.toString.service"
import {ISelectMatchHandler} from "../../handler/select.match.handler"
import {SelectMatchEvent} from "../../handler/select.match.event"
import {MaterializeAction} from "angular2-materialize";
import {Match} from '../../data/match';

@Component({
  selector: "modal-select-match",
  templateUrl : "assets/javascripts/views/table/table.select.match.modal.view.component.html"
})
export class SelectMatchModalComponent{

  public modalActions = new EventEmitter<string|MaterializeAction>();
  public matches: Match[];
  public selectedMatches: Match[];
  private selectMatchHandler: ISelectMatchHandler;
  public selectedMatch: Match;
  public checkedMatches: boolean[];
  
  constructor(public matchToStringService: MatchToStringService) {
      this.checkedMatches = [];
  }

  onSelectMatchEvent(selectEvent: SelectMatchEvent){
      this.matches = selectEvent.matches;
      this.selectMatchHandler = selectEvent.handler;
      this.openModal();
  }

  openModal(){
    this.modalActions.emit({action:"modal",params:["open"]});
  }

  onOK(){
    this.closeDialogAndInformObserversAboutResult();
  }

  closeDialogAndInformObserversAboutResult(){
    this.selectedMatches = this.matches.filter(x=> x.isPlayed === true);
    if(!this.selectedMatches || this.selectedMatches.length < 1){
      alert("Bitte Spiel auswählen.");
      return;
    }
    this.selectMatchHandler.handleSelection(this.selectedMatches);
    this.closeModal();
  }

  onAllSelected(){
    this.selectMatchHandler.handleAll(this.matches);
    this.closeModal();
  }

  onCancel(){
    this.closeModal();
  }

  closeModal() {
        this.modalActions.emit({action:"modal",params:["close"]});
    }

  beforeDismiss(): boolean {
    return true;
  }

  beforeClose(): boolean {
    return false;
  }
}