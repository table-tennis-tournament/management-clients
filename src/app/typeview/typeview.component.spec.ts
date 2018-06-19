import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeviewComponent } from './typeview.component';

describe('TypeviewComponent', () => {
  let component: TypeviewComponent;
  let fixture: ComponentFixture<TypeviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TypeviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TypeviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
