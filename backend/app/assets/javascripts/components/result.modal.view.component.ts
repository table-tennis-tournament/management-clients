import { Component } from "@angular/core";

import { DialogRef, ModalComponent, CloseGuard } from "angular2-modal";
import { BSModalContext } from "angular2-modal/plugins/bootstrap/index";
import {Match} from "../data/match"
import {IResult} from "../data/result"
import {MatchToStringService} from "../services/match.toString.service"
import {Observable} from "rxjs/Rx";
import {IResultHandler} from "../handler/result.handler"

export class CustomModalContext extends BSModalContext {
  public currentMatch: Match;
  public handler: IResultHandler;
}

/**
 * A Sample of how simple it is to create a new window, with its own injects.
 */
@Component({
  selector: "modal-content",
  /* tslint:disable */ template: `
   <div class="container-fluid custom-modal-container">
          
            <div class="row modal-content">
              <div align="center">
                  <div [class.text-bold]="isFirstPlayerWinning">{{firstPlayerString}} </div><br/>
                  - <br/>
                  <div [class.text-bold]="isSecondPlayerWinning">{{secondPlayerString}}</div>
              </div>
                <div class="col s1"></div>
                <div class="input-field col s10">
                      <input id="result" class="form-control" type="text" autofocus #answer (keyup)="onKeyUp(answer.value)" (keyup.enter)="onEnterPressed(answer.value)">
                      <label for="result">Ergebnis (bsp. -7 8 8 9)</label>
                </div>
            </div>
            <div class="row modal-footer">
              <a href="javascript:void(0)" [class.disabled]="!resultIsValid" class="modal-action waves-effect waves-green btn-flat" (click)="onOK()">OK</a>
              <a href="javascript:void(0)" class="modal-action modal-close waves-effect waves-green btn-flat"  (click)="onCancel()">Abbrechen</a>
            </div>
        </div>
      `
})
export class CustomModal implements CloseGuard, ModalComponent<CustomModalContext> {
  context: CustomModalContext;

  public resultIsValid: boolean;
  public shouldUseMyClass: boolean;
  public firstPlayerString: string;
  public secondPlayerString: string;
  public isFirstPlayerWinning: boolean;
  public isSecondPlayerWinning: boolean;
  public OnResultGotObserver: Observable<IResult[]>
  private currentObserver: any;
  public currentResult: IResult[];
  
  constructor(public dialog: DialogRef<CustomModalContext>, public matchToStringService: MatchToStringService) {
    this.context = dialog.context;
    this.resultIsValid = false;
    dialog.setCloseGuard(this);
    this.firstPlayerString = matchToStringService.getPlayersNamesLong(this.context.currentMatch.team1);
    this.secondPlayerString = matchToStringService.getPlayersNamesLong(this.context.currentMatch.team2);
     this.OnResultGotObserver = Observable.create((observer) => {
            console.log("On Result got Observable created");
            this.currentObserver = observer;
        }).share();
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

  onOK(){
    this.closeDialogAndInformObserversAboutResult();
  }

  closeDialogAndInformObserversAboutResult(){
    this.dialog.close();
    if(this.context.handler !== null){
      this.context.handler.handleResult(this.currentResult);
    }
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
      if(!isNaN(currentValue)){
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
    this.dialog.close();
  }

  beforeDismiss(): boolean {
    return true;
  }

  beforeClose(): boolean {
    return false;
  }
}