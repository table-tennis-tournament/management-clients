import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent {
  disciplines = ['Herren A', 'Herren B', 'Herren C'];
}
