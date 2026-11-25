import { SetScore } from '../../shared/result-entry/result-entry';
import { Game } from './game.model';

/** Maps the table-manager DTO games (`score_player_a/b`) to the Sets of `shared/result-entry`. */
export function toSets(games: Game[] | null | undefined): SetScore[] {
  return (games ?? []).map((game) => ({
    pointsPlayer1: game.score_player_a ?? 0,
    pointsPlayer2: game.score_player_b ?? 0,
  }));
}

export function toGames(sets: SetScore[]): Game[] {
  return sets.map((set) => ({ score_player_a: set.pointsPlayer1, score_player_b: set.pointsPlayer2 }));
}
