import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ResultUpdatesService } from './updates/result-updates.service';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(private updates: ResultUpdatesService) {}

  ngOnInit(): void {
    this.updates.start();
  }

  ngOnDestroy(): void {
    this.updates.stop();
  }
}
