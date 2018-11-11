import {EventEmitter} from "@angular/core";
import {MaterializeAction} from "angular2-materialize";

export abstract class BaseModal{

    public modalActions = new EventEmitter<string|MaterializeAction>();

    onOK(){
        this.closeDialogAndInformObserversAboutResult();
      }
    
    closeDialogAndInformObserversAboutResult(){
        this.onConfirmAction();
        this.closeModal();
    }
    
    protected abstract onConfirmAction();

    closeModal() {
        this.modalActions.emit({action:"modal",params:["close"]});
    }

    openModal(){
        this.modalActions.emit({action:"modal",params:["open"]});
      }
}