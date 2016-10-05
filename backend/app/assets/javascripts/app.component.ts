import {Component, OnInit} from 'angular2/core';
import {Player} from './data/Player';
import {HeroDetailComponent} from './hero-detail.component';
import {HeroService} from './hero.service';

@Component({
  selector: 'my-app',
  template:`
    <h1>{{title}}</h1>
    <h2>My Heroes</h2>
    <ul class="heroes">
      <li *ngFor="#hero of heroes"
        [class.selected]="hero === selectedHero"
        (click)="onSelect(hero)">
        <span class="badge">{{hero.id}}</span> {{hero.firstName}}
      </li>
    </ul>
    <my-hero-detail [hero]="selectedHero"></my-hero-detail>
  `,
  directives: [HeroDetailComponent],
  providers: [HeroService]
})
export class AppComponent implements OnInit {
  public title = 'TurnierManager';
  public heroes: Player[];
  public selectedHero: Player;

  constructor(private _heroService: HeroService) { }

  getHeroes() {
    this._heroService.getHeroes().then(heroes => this.heroes = heroes);
  }

  ngOnInit() {
    this.getHeroes();
  }

  onSelect(hero: Player) { this.selectedHero = hero; }
}
