import {DisciplineGroup} from "./discipline.group"

export class DisciplineTab{
    id: number;
    name: string;
    groups: DisciplineGroup[];
    assignedTables: number[];

    constructor(id: number, name: string){
        this.id = id;
        this.name = name;
    }
}