import {Component, Input} from "@angular/core";

@Component({
    selector: "test-view",
    templateUrl : "assets/javascripts/views/discipline.final.view.component.html"
})
export class DisciplineFinalViewComponent{

    
   constructor(){
       console.log("Init discipline final view");
   }
}