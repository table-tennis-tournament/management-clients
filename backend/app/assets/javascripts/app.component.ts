import {Component} from "@angular/core"
import {WebSocketService} from "./services/web.socket.service"
import {TypeColors} from "./data/typeColors"

@Component({
  selector: "tt-app",
  templateUrl:"assets/javascripts/views/main.component.html"
})
export class AppComponent{

  constructor(private webSocketService: WebSocketService){
    console.log("before init websocket");
    // this.webSocketService.initializeWebSocket("ws://192.168.1.10:9000/register");
    new TypeColors();
  }

}
