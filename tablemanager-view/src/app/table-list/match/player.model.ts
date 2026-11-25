export interface Player {
  player_id?: number;
  first_name?: string;
  last_name?: string;
  club?: string;
  /** How often the player has been called: 0 before the first Call, then 1 to 3. */
  call_count?: number;
  /** The player's next call is requested and waits for the caller. */
  call_requested?: boolean;
}
