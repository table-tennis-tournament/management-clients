import {Component} from '@angular/core';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSidenavContainer, MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { MatNavList, MatListItem } from '@angular/material/list';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss'],
    imports: [MatToolbar, MatToolbarRow, MatIconButton, MatIcon, MatSidenavContainer, MatSidenav, MatNavList, MatListItem, RouterLinkActive, RouterLink, MatSidenavContent, RouterOutlet]
})
export class NavigationComponent {

    managers = [1, 2, 3, 4];
}
