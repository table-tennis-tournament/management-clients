export class Type{
    id: number;
    name: string;
    kind: number;

    constructor(typeName: string, id: number){
        this.name = typeName;
        this.id = id;
    }
}