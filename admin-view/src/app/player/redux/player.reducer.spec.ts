import { PlayerType } from '../data/player.type.model';
import { LoadPlayers, LoadPlayersSuccess, SetPlayerPaidSuccess } from './player.actions';
import { PlayerState, reducePlayerState } from './player.reducer';

describe('the player reducer', () => {
  const herren = { id: 1, name: 'Herren' };
  const unpaid: PlayerType = { id: 1, type: herren, paid: false };
  const other: PlayerType = { id: 2, type: herren, paid: false };
  const initialState: PlayerState = Object.freeze({ players: [], playersLoading: false });

  it('starts empty', () => {
    expect(reducePlayerState(undefined, { type: 'unknown' } as any)).toEqual(initialState);
  });

  it('marks the players as loading', () => {
    expect(reducePlayerState(initialState, new LoadPlayers(null))).toEqual({ players: [], playersLoading: true });
  });

  it('stores the loaded players', () => {
    const loading = { ...initialState, playersLoading: true };
    expect(reducePlayerState(loading, new LoadPlayersSuccess([unpaid, other]))).toEqual({
      players: [unpaid, other],
      playersLoading: false,
    });
  });

  it('replaces the registration marked as paid and keeps the others', () => {
    const state = { ...initialState, players: [unpaid, other] };
    const paid = { ...unpaid, paid: true };
    expect(reducePlayerState(state, new SetPlayerPaidSuccess(paid))).toEqual({
      players: [paid, other],
      playersLoading: false,
    });
  });
});
