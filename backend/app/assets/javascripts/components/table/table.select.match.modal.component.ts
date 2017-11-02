import {Component, EventEmitter, Injectable, Input, Output, ElementRef, Renderer, Inject } from "@angular/core";
import {MatchDto} from "../../data/match.dto"
import {IResult} from "../../data/result"
import {MatchToStringService} from "../../services/match.toString.service"
import {Observable} from "rxjs/Rx";
import {IResultHandler} from "../../handler/result.handler"
import {MaterializeAction} from "angular2-materialize";

@Component({
  selector: "modal-select-match",
  templateUrl : "assets/javascripts/views/table/table.select.match.modal.view.component.html"
})
export class SelectMatchModalComponent{

  public modalActions = new EventEmitter<string|MaterializeAction>();
  public matches: MatchDto[];
  public selectedMatches: MatchDto[];
  
  constructor(public matchToStringService: MatchToStringService) {
    console.log("in result handler");
  }

  setMatches(matchToSet: MatchDto[]){
      this.matches = matchToSet;
  }

  setResultHandler(handlerToSet: IResultHandler){
      console.log("in result handler");
  }
  
  openModal(){
    this.modalActions.emit({action:"modal",params:["open"]});
  }

  onOK(){
    this.closeDialogAndInformObserversAboutResult();
  }

  closeDialogAndInformObserversAboutResult(){
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