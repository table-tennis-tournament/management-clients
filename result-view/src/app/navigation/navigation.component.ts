import { Component } from '@angular/core';
import { getApiVersion, setApiVersion } from '../api-version';

@Component({
  standalone: false,
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent {
  disciplines = ['Herren A', 'Herren B', 'Herren C'];
  apiVersionV2: boolean = getApiVersion() === 'v2';

  onApiVersionChange() {
    setApiVersion(this.apiVersionV2 ? 'v2' : 'v1');
    location.reload();
  }
}
