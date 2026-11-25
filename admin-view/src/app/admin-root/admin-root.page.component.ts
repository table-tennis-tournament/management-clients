import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AdminRootComponent } from './admin-root.component';

@Component({
  selector: 'toma-admin-root.page',
  templateUrl: './admin-root.page.component.html',
  styleUrls: ['./admin-root.page.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AdminRootComponent],
})
export class AdminRootPageComponent {
  constructor() {}
}
