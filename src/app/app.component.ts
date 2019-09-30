import {Component} from '@angular/core';
import {TestServiceService} from './services/test-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'match-management-app';

  result = 'empty';

  constructor(private service: TestServiceService) {
  }

  onApiCall1() {
    this.service.call1().subscribe(x => this.result = x);
  }

  onApiCall2() {
    this.service.call2().subscribe(x => this.result = x);
  }
}
