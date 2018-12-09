import {Component, Input} from "@angular/core";


@Component({
    selector: "result-string-item",
    templateUrl : "assets/javascripts/views/results/result.string.component.html",
})
export class ResultStringItemComponent{

    private _result: any[];
    public resultString:string;

    constructor(){
        
    }

    @Input("result")
    set result(value: any[]){
        this._result = value;
        if(this._result === null || this._result === undefined || this._result.length < 1){
            this.resultString = "";
            return;
        }
        let firstPlayerSets = 0;
        let secondPlayerSets = 0;
        this._result.forEach((element) => {
            if(element[0]>element[1]){
                firstPlayerSets++;
              } else{
                secondPlayerSets++;
              }
        });

        this.resultString = firstPlayerSets + " : "+secondPlayerSets;
    } 
   
}