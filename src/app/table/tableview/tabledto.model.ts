import {Match} from '../../matchview/match.model';
import {Table} from './table.model';

export interface TableDto {
    table?: Table;
    matchinfo: Match[];
}
