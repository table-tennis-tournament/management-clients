import {Match} from '../../../shared/data/match.model';

export interface DisciplineStage {
    name?: string;
    matches?: Match[];
    isComplete?: boolean;
}
