import {DisciplineGroup} from './discipline.group.model';
import {DisciplineStage} from './discipline.stage.model';

export interface DisciplineTab {
    id?: number;
    name?: string;
    groups?: DisciplineGroup[];
    stages?: DisciplineStage[];
    isActive?: boolean;
}
