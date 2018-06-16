import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClubviewComponent } from './clubview.component';

describe('ClubviewComponent', () => {
  let component: ClubviewComponent;
  let fixture: ComponentFixture<ClubviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClubviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClubviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
