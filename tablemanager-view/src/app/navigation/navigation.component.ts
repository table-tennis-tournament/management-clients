import { Component } from '@angular/core';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSidenavContainer, MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { MatNavList, MatListItem } from '@angular/material/list';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { getApiVersion, setApiVersion } from '../api-version';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  imports: [
    MatToolbar,
    MatToolbarRow,
    MatIconButton,
    MatIcon,
    MatSidenavContainer,
    MatSidenav,
    MatNavList,
    MatListItem,
    MatSlideToggle,
    RouterLinkActive,
    RouterLink,
    MatSidenavContent,
    RouterOutlet,
  ],
})
export class NavigationComponent {
  managers = [1, 2, 3, 4];
  apiVersionV2: boolean = getApiVersion() === 'v2';

  onApiVersionChange(checked: boolean) {
    setApiVersion(checked ? 'v2' : 'v1');
    location.reload();
  }
}
