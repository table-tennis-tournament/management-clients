import {Match} from "./match"

export interface Table{
    id: number,
    tableNumber: number,
    match: Match,
    isLocked: boolean
}