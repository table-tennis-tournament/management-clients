import {Component} from '@angular/core';

@Component({
    selector: 'app-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss'],
    standalone: false
})
export class NavigationComponent {

    disciplines = ['Herren A', 'Herren B', 'Herren C'];
}
