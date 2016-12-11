import {Component} from "@angular/core"
import {WebSocketService} from "./services/web.socket.service"

@Component({
  selector: "tt-app",
  templateUrl:"assets/javascripts/views/main.component.html"
})
export class AppComponent{

  constructor(private webSocketService: WebSocketService){
    console.log("before init websocket");
    this.webSocketService.initializeWebSocket("ws://192.168.178.27:9000/ws");
  }

}
