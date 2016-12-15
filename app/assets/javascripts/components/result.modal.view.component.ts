import { Component } from "@angular/core";

import { DialogRef, ModalComponent, CloseGuard } from "angular2-modal";
import { BSModalContext } from "angular2-modal/plugins/bootstrap/index";
import {Match} from "../data/match"
import {MatchToStringService} from "../services/match.toString.service"

export class CustomModalContext extends BSModalContext {
  public currentMatch: Match;
}

/**
 * A Sample of how simple it is to create a new window, with its own injects.
 */
@Component({
  selector: "modal-content",
  // TODO: [ngClass] here on purpose, no real use, just to show how to workaround ng2 issue #4330.
  // Remove when solved.
  /* tslint:disable */ template: `
   <div class="container-fluid custom-modal-container">
          
            <div class="row modal-content">
              <p align="center">
                  {{firstPlayerString}} <br/>
                  - <br/>
                  {{secondPlayerString}}
              </p>
                <div class="input-field col s6">
                      <input id="result" class="form-control" type="text" autofocus #answer (keyup)="onKeyUp(answer.value)" (keyup.enter)="onEnterPressed(answer.value)">
                      <label for="result">Ergebnis (11:7 oder 7, bzw. 7:11 oder -7)</label>
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

  constructor(public dialog: DialogRef<CustomModalContext>, public matchToStringService: MatchToStringService) {
    this.context = dialog.context;
    this.resultIsValid = false;
    dialog.setCloseGuard(this);
    this.firstPlayerString = matchToStringService.getPlayersNamesLong(this.context.currentMatch.team1);
    this.secondPlayerString = matchToStringService.getPlayersNamesLong(this.context.currentMatch.team2);
  }

  onKeyUp(value){
    console.log(value);
    this.resultIsValid = this.checkValidResult(value);
    console.log("Current result is valid: " + this.resultIsValid);
  }

  onEnterPressed(value){
    if(this.resultIsValid){
      this.dialog.close();
    }
  }

  checkValidResult(valueToCheck): boolean{
    var splittedValue = valueToCheck.split(" ");
    if(splittedValue.length < 3){
      return false;
    }
    var player1 = 0;
    var player2 = 0;
    for(var index = 0; index < splittedValue.length; index++){
      var currentValue = splittedValue[index];
      if(currentValue < 0){
        player2++;
        continue;
      }
      if(currentValue > 0){
        player1++;
        continue;
      }
    }
    if(player1 >2 || player2 > 2){
      return true;
    }
    return false;
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