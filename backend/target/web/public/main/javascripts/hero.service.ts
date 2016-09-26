import {Player} from './data/player';
import {PLAYERS} from './mock-heroes';
import {Injectable} from 'angular2/core';

@Injectable()
export class HeroService {
  getHeroes() {
    return Promise.resolve(PLAYERS);
  }

  // See the "Take it slow" appendix
  getHeroesSlowly() {
    return new Promise<Player[]>(resolve =>
      setTimeout(()=>resolve(PLAYERS), 2000) // 2 seconds
    );
  }
}
