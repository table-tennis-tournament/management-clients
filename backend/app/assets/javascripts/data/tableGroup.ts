import {Table} from "./table"

export interface TableGroup{
    id: number,
    tables: Table[],
    name: string
}