import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerviewComponent } from './playerview.component';

describe('PlayerviewComponent', () => {
  let component: PlayerviewComponent;
  let fixture: ComponentFixture<PlayerviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayerviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
