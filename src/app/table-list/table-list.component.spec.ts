import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TableService } from './table.service';
import { TableListComponent } from './table-list.component';
describe('TableListComponent', () => {
  let component: TableListComponent;
  let fixture: ComponentFixture<TableListComponent>;
  beforeEach(() => {
    const tableServiceStub = { getTables: () => ({ subscribe: () => ({}) }) };
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [TableListComponent],
      providers: [{ provide: TableService, useValue: tableServiceStub }]
    });
    fixture = TestBed.createComponent(TableListComponent);
    component = fixture.componentInstance;
  });
  it('can load instance', () => {
    expect(component).toBeTruthy();
  });
  describe('ngOnInit', () => {
    it('makes expected calls', () => {
      const tableServiceStub: TableService = fixture.debugElement.injector.get(
        TableService
      );
      spyOn(tableServiceStub, 'getTables').and.callThrough();
      component.ngOnInit();
      expect(tableServiceStub.getTables).toHaveBeenCalled();
    });
  });
});
