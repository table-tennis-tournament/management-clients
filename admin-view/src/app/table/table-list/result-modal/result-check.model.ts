import { TTResult } from './ttresult.model';

export interface ResultCheckModel {
  firstPlayerWinning?: boolean;
  secondPlayerWinning?: boolean;
  currentResult?: TTResult[];
}
