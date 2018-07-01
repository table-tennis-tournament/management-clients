import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TttableviewComponent} from './tttableview.component';

describe('TttableviewComponent', () => {
    let component: TttableviewComponent;
    let fixture: ComponentFixture<TttableviewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TttableviewComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TttableviewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
