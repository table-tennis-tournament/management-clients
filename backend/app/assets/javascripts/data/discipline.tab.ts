import {DisciplineGroup} from "./discipline.group"
import {DisciplineStage} from "./discipline.stage"

export class DisciplineTab{
    id: number;
    name: string;
    groups: DisciplineGroup[] = [];
    stages: DisciplineStage[] =[];
    assignedTables: number[] = [];

    get rowCount(): number[] {
        if(!this.groups){
            return Array.from(Array(Math.ceil(0)).keys());;
        }
        return Array.from(Array(Math.ceil(this.groups.length / 4)).keys());
    }

    constructor(id: number, name: string, kind: number){
        this.id = id;
        this.name = name;
        if(kind ===2){
            this.name = this.name + "-Doppel";
        }
    }
}