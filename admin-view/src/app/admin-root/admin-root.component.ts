import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NavigationComponent } from '../navigation/navigation.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'toma-admin-root',
  templateUrl: './admin-root.component.html',
  styleUrls: ['./admin-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NavigationComponent, RouterOutlet],
})
export class AdminRootComponent {}
