import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-tab-item',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './tab-item.component.html',
})
export class TabItemComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
