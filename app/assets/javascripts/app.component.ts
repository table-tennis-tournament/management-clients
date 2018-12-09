import {Component} from "@angular/core"
import {WebSocketService} from "./services/web.socket.service"
import {TypeColors} from "./data/typeColors"
import {DisciplineShortcuts} from "./data/disciplineShortcuts"

@Component({
  selector: "tt-app",
  templateUrl:"assets/javascripts/views/main.component.html"
})
export class AppComponent{

  constructor(private webSocketService: WebSocketService){
    this.webSocketService.initializeWebSocket("ws://127.0.0.1:9000/register");
    new TypeColors();
    new DisciplineShortcuts();
  }

}
