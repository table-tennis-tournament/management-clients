import {Component, Input} from "@angular/core";
import {Match} from "../data/match";


@Component({
    selector : "modal-match",
    templateUrl : "assets/javascripts/view/match.modal.component.html"
})
export class ModalMatchComponent{
  
  @Input() match:Match;
}