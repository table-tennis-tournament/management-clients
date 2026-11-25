import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TypeColorMap } from '../../settings/settings.model';
import { TypeColorDirective } from './type-color.directive';

@Component({
  template: `<div [tomaTypeColor]="typeId()" [typeColors]="colors()"></div>`,
  imports: [TypeColorDirective],
})
class HostComponent {
  typeId = signal<number>(1);
  colors = signal<TypeColorMap>({ 1: { bgColor: 'rgb(255, 0, 0)', textColor: 'rgb(255, 255, 255)' } });
}

describe('the type color directive', () => {
  function render() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    const style = () => [div.style.backgroundColor, div.style.color];
    return { fixture, style };
  }

  it('colors the element in the colors of its discipline', () => {
    expect(render().style()).toEqual(['rgb(255, 0, 0)', 'rgb(255, 255, 255)']);
  });

  it('follows a change of the discipline and falls back to black on transparent for one without colors', () => {
    const { fixture, style } = render();

    fixture.componentInstance.typeId.set(2);
    fixture.detectChanges();

    expect(style()).toEqual(['transparent', 'rgb(0, 0, 0)']);
  });

  it('follows a change of the colors', () => {
    const { fixture, style } = render();

    fixture.componentInstance.colors.set({ 1: { bgColor: 'rgb(0, 0, 255)', textColor: 'rgb(0, 0, 0)' } });
    fixture.detectChanges();

    expect(style()).toEqual(['rgb(0, 0, 255)', 'rgb(0, 0, 0)']);
  });

  it('leaves the element alone while the colors are not loaded', () => {
    const { fixture, style } = render();
    fixture.componentInstance.colors.set(null);
    fixture.componentInstance.typeId.set(2);
    fixture.detectChanges();

    // the colors of discipline 1 stay until colors arrive
    expect(style()).toEqual(['rgb(255, 0, 0)', 'rgb(255, 255, 255)']);
  });
});
