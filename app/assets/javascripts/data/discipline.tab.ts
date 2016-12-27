import {DisciplineGroup} from "./discipline.group"

export class DisciplineTab{
    id: number;
    name: string;
    groups: DisciplineGroup[];
    assignedTables: number[];

    get rowCount(): number[] {
        return Array.from(Array(Math.ceil(this.groups.length / 4)).keys());
    }

    constructor(id: number, name: string){
        this.id = id;
        this.name = name;
    }
}