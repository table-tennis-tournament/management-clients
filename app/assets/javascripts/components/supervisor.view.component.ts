import {Component, ViewContainerRef, ViewEncapsulation} from "@angular/core"
import {MatchService} from "../services/match.service"
import {TableService} from "../services/table.service"
import {MatchToStringService} from "../services/match.toString.service"

import {Table} from "../data/table"
import {TableDto} from "../data/table.dto"
import {Match} from "../data/match"

import { Overlay } from "angular2-modal";
import { Modal } from "angular2-modal/plugins/bootstrap";


@Component({
  templateUrl:"assets/javascripts/views/supervisor.view.component.html"
})
export class SupervisorViewComponent{

}