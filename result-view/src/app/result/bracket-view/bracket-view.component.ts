import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DisciplineStage } from '../data/discipline.stage';
import { Match } from '../data/match';
import { Player } from '../data/player';

interface BracketEntry {
  match: Match;
  top: number;
  vertical: { top: number; height: number } | null;
  hasIncoming: boolean;
  hasOutgoing: boolean;
}

@Component({
  selector: 'app-bracket-view',
  standalone: false,
  templateUrl: './bracket-view.component.html',
  styleUrls: ['./bracket-view.component.scss'],
})
export class BracketViewComponent implements OnChanges {
  private static readonly MATCH_HEIGHT = 70;
  private static readonly MATCH_WIDTH = 200;
  private static readonly ROUND_GAP = 60;
  private static readonly VERTICAL_GAP = 40;
  private static readonly TITLE_HEIGHT = 40;

  roundWidth = BracketViewComponent.MATCH_WIDTH + BracketViewComponent.ROUND_GAP;
  matchAreaHeight = 0;
  bracketHeight = 0;
  bracketWidth = 0;
  rounds: BracketEntry[][] = [];
  names: string[] = [];

  @Input() stages: DisciplineStage[] = [];

  teamLabel(players: Player[] | undefined): string {
    if (!players || players.length === 0) {
      return '';
    }
    if (players.length === 1) {
      return `${players[0].firstName ?? ''} ${players[0].lastName ?? ''}`.trim();
    }
    return players
      .map((player) => player.lastName ?? '')
      .filter((name) => name !== '')
      .join(' / ');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['stages']) {
      this.build();
    }
  }

  private build(): void {
    this.rounds = [];
    this.names = [];
    if (!this.stages || this.stages.length === 0) {
      return;
    }

    const unit = BracketViewComponent.MATCH_HEIGHT + BracketViewComponent.VERTICAL_GAP;
    const totalRounds = this.stages.length;
    const firstRoundCount = this.stages[0].matches.length;

    this.matchAreaHeight = (firstRoundCount - 1) * unit + BracketViewComponent.MATCH_HEIGHT;
    this.bracketHeight = this.matchAreaHeight + BracketViewComponent.TITLE_HEIGHT;
    this.bracketWidth = totalRounds * this.roundWidth;
    this.names = this.stages.map((stage) => stage.name);

    this.rounds = this.stages.map((stage, roundIndex) => {
      const hasOutgoing = roundIndex < totalRounds - 1;
      const hasIncoming = roundIndex > 0;
      return stage.matches.map((match, matchIndex) => {
        const top = (Math.pow(2, roundIndex + 1) * matchIndex + Math.pow(2, roundIndex) - 1) * (unit / 2);
        let vertical: { top: number; height: number } | null = null;
        if (hasOutgoing) {
          const height = Math.pow(2, roundIndex - 1) * unit;
          const down = matchIndex % 2 === 0;
          vertical = {
            top: down ? BracketViewComponent.MATCH_HEIGHT / 2 : BracketViewComponent.MATCH_HEIGHT / 2 - height,
            height,
          };
        }
        return { match, top, vertical, hasIncoming, hasOutgoing };
      });
    });
  }
}
