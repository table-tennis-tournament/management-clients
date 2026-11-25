import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { TableUpdatesService } from './table-list/table-updates.service';
import { NavigationComponent } from './navigation/navigation.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NavigationComponent, RouterOutlet],
})
export class AppComponent implements OnInit {
  private tableUpdates = inject(TableUpdatesService);

  ngOnInit(): void {
    this.tableUpdates.start();
  }
}
