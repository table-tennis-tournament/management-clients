import {DisciplineGroup} from "./discipline.group"
import {DisciplineStage} from "./discipline.stage"

export class DisciplineTab{
    id: number;
    name: string;
    groups: DisciplineGroup[] = [];
    stages: DisciplineStage[] =[];
    isActive:boolean = false;

    get rowCount(): number[] {
        if(!this.groups){
            return Array.from(Array(Math.ceil(0)).keys());;
        }
        return Array.from(Array(Math.ceil(this.groups.length / 4)).keys());
    }

    get stageRowCount(): number[]{
        if(!this.stages){
            return Array.from(Array(Math.ceil(0)).keys());;
        }
        return Array.from(Array(Math.ceil(this.stages.length / 3)).keys());
    }


    constructor(id: number, name: string, kind: number){
        this.id = id;
        this.name = name;
        if(kind ===2){
            this.name = this.name + "-Doppel";
        }
    }

    public setValuesOnGroupActive(isMatchActive:boolean, isPlayerActive: boolean){
        for(var index = 0; index < this.groups.length; index++){
            this.groups[index].isMatchActive = isMatchActive;
            this.groups[index].isPlayerActive = isPlayerActive;
        }
    }
}