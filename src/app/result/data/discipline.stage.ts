import {Match} from './match';

export class DisciplineStage {
  name: string;
  matches: Match[] = [];
  bgColor: string;
  textColor: string;
  isComplete: boolean;
}
