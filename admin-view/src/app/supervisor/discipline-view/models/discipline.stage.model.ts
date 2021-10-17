import { Match } from '../../../shared/data/match.model';

export interface DisciplineStage {
  id?: number;
  name?: string;
  matches?: Match[];
  isComplete?: boolean;
}
