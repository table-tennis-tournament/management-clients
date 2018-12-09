import {Component, EventEmitter} from "@angular/core";
import {IResult} from "../data/result"
import {MatchToStringService} from "../services/match.toString.service"
import {Observable} from "rxjs/Rx";
import {IResultHandler} from "../handler/result.handler"
import {MaterializeAction} from "angular2-materialize";
import {Match} from '../data/match';

@Component({
  selector: "modal-result",
  templateUrl : "assets/javascripts/views/result.modal.view.component.html"
})
export class ResultModalComponent{

  public resultIsValid: boolean;
  public shouldUseMyClass: boolean;
  public firstPlayerString: string;
  public secondPlayerString: string;
  public headerString: string;
  public isFirstPlayerWinning: boolean;
  public isSecondPlayerWinning: boolean;
  public OnResultGotObserver: Observable<IResult[]>
  private currentResultHandler: IResultHandler;
  public currentResult: IResult[];
  public modalActions = new EventEmitter<string|MaterializeAction>();

  public currentInput: string;

  private currentMatch: Match;
  
  constructor(public matchToStringService: MatchToStringService) {
    this.resultIsValid = false;
  }

  setMatch(matchToSet: Match){
    this.firstPlayerString = this.matchToStringService.getPlayersNamesLong(matchToSet.team1);
    this.secondPlayerString = this.matchToStringService.getPlayersNamesLong(matchToSet.team2);
    this.headerString = matchToSet.type.name + " " + matchToSet.matchType.name;
    this.currentMatch = matchToSet;
  }

  setResultHandler(handlerToSet: IResultHandler){
    this.currentResultHandler = handlerToSet;
  }

  onKeyUp(value){
    this.resultIsValid = this.checkValidResult(value);
  }

  onEnterPressed(value){
        if(this.resultIsValid){
            this.closeDialogAndInformObserversAboutResult();
        }
    }

  openModal(){
    this.setInputIfAvailable();
    this.modalActions.emit({action:"modal",params:["open"]});
  }

  setInputIfAvailable(){
      const matchToSet = this.currentMatch;
      let resultString = "";
      if(matchToSet.result){
      matchToSet.result.forEach(element => {
        if(element[0]>element[1]){
          resultString += element[1] + " ";
        } else{
          resultString += "-"+element[0] + " ";
        }
      });
      resultString = resultString.substr(0, resultString.length - 1);
      this.checkValidResult(resultString);
    }
    this.currentInput = resultString;
  }

  onOK(){
    this.closeDialogAndInformObserversAboutResult();
  }

  closeDialogAndInformObserversAboutResult(){
    if(this.currentResultHandler !== null && this.currentResultHandler !== undefined){
      this.currentResultHandler.handleResult(this.currentResult, this.currentMatch);
    }
    this.currentResult = [];
    this.isFirstPlayerWinning = false;
    this.isSecondPlayerWinning = false;
    this.closeModal();
  }

  checkValidResult(valueToCheck): boolean{
    let otherResult;
      this.isFirstPlayerWinning = false;
    this.isSecondPlayerWinning = false;
    this.currentResult = [];
      const splittedValue = valueToCheck.split(" ");
      if(splittedValue.length < 3){
      return false;
    }
      let player1 = 0;
      let player2 = 0;
      for(let index = 0; index < splittedValue.length; index++){
        const currentValue = splittedValue[index];
        if(this.isFirstCharAMinus(currentValue)){
          const resultWithoutMinus = +currentValue.substring(1);
          otherResult = this.getOtherResult(resultWithoutMinus);
        this.currentResult[index] =  [resultWithoutMinus, otherResult];
        player2++;
        continue;
      }
      if(currentValue!== "" && !isNaN(currentValue)){
          otherResult = +this.getOtherResult(+currentValue);
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
    return resultToCheck.charAt(0) === "-";
  }

  getOtherResult(opponentsResult: number): number{
    if(opponentsResult < 10){
      return 11;
    }
    return opponentsResult + 2;
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