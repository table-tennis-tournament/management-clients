import { Component, EventEmitter, Injectable } from "@angular/core";
import {Match} from "../data/match"
import {IResult} from "../data/result"
import {MatchToStringService} from "../services/match.toString.service"
import {Observable} from "rxjs/Rx";
import {IResultHandler} from "../handler/result.handler"
import {MaterializeAction} from "angular2-materialize";

@Component({
  selector: "modal-result",
  /* tslint:disable */ template: `
  <div id="modal1" class="modal" materialize="modal" [materializeParams]="[{dismissible: false}]" [materializeActions]="modalActions">
    <div class="modal-content">
      <h4>Modal Header</h4>
      <div [class.text-bold]="isFirstPlayerWinning">{{firstPlayerString}} </div><br/>
                  - <br/>
                  <div [class.text-bold]="isSecondPlayerWinning">{{secondPlayerString}}</div>
      </div>
       <div class="input-field col s10">
                      <input id="result" class="form-control" type="text" autofocus #answer (keyup)="onKeyUp(answer.value)" (keyup.enter)="onEnterPressed(answer.value)">
                      <label for="result">Ergebnis (bsp. -7 8 8 9)</label>
       </div>
    <div class="modal-footer">
      <a class="waves-effect waves-green btn-flat"  (click)="onCancel()">Abbrechen</a>
      <a class="modal-action modal-close waves-effect waves-green btn-flat" [class.disabled]="!resultIsValid" (click)="onOK()">OK</a>
    </div>
  </div>
      `
})
export class ResultModalComponent{

  public resultIsValid: boolean;
  public shouldUseMyClass: boolean;
  public firstPlayerString: string;
  public secondPlayerString: string;
  public isFirstPlayerWinning: boolean;
  public isSecondPlayerWinning: boolean;
  public OnResultGotObserver: Observable<IResult[]>
  private currentResultHandler: IResultHandler;
  public currentResult: IResult[];
  public modalActions = new EventEmitter<string|MaterializeAction>();
  
  constructor(public matchToStringService: MatchToStringService) {
    this.resultIsValid = false;
  }

  setMatch(matchToSet: Match){
    this.firstPlayerString = this.matchToStringService.getPlayersNamesLong(matchToSet.team1);
    this.secondPlayerString = this.matchToStringService.getPlayersNamesLong(matchToSet.team2);
  }

  setResultHandler(handlerToSet: IResultHandler){
    this.currentResultHandler = handlerToSet;
  }

  onKeyUp(value){
    console.log(value);
    this.resultIsValid = this.checkValidResult(value);
    console.log("Current result is valid: " + this.resultIsValid);
  }

  onEnterPressed(value){
    if(this.resultIsValid){
      this.closeDialogAndInformObserversAboutResult();
    }
  }

  openModal(){
    this.modalActions.emit({action:"modal",params:["open"]});
  }

  onOK(){
    this.closeDialogAndInformObserversAboutResult();
  }

  closeDialogAndInformObserversAboutResult(){
    if(this.currentResultHandler !== null){
      this.currentResultHandler.handleResult(this.currentResult);
    }
    this.closeModal();
  }

  checkValidResult(valueToCheck): boolean{
    this.isFirstPlayerWinning = false;
    this.isSecondPlayerWinning = false;
    this.currentResult = [];
    var splittedValue = valueToCheck.split(" ");
    if(splittedValue.length < 3){
      return false;
    }
    var player1 = 0;
    var player2 = 0;
    for(var index = 0; index < splittedValue.length; index++){
      var currentValue = splittedValue[index];
      if(this.isFirstCharAMinus(currentValue)){
        var resultWithoutMinus = +currentValue.substring(1);
        var otherResult = this.getOtherResult(resultWithoutMinus);
        this.currentResult[index] =  [resultWithoutMinus, otherResult];
        player2++;
        continue;
      }
      if(currentValue!== "" && !isNaN(currentValue)){
        var otherResult = +this.getOtherResult(+currentValue)
        this.currentResult[index] = [otherResult, +currentValue];
        player1 ++;
        continue;
      }
    }
    if(player1 === 3 && player2 < 3){
      this.isFirstPlayerWinning = true;
      return true;
    }
     if(player2 === 3 && player1 < 3){
      this.isSecondPlayerWinning = true;
      return true;
    }
    return false;
  }

  isFirstCharAMinus(resultToCheck){
    return resultToCheck.charAt(0) === '-';
  }

  getOtherResult(opponentsResult : number): number{
    if(opponentsResult < 10){
      return 11;
    }
    return opponentsResult + 2;
  }

  onCancel(){
    console.log("in Close");
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