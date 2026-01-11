import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';
import { TypeColorMap } from '../../settings/settings.model';

@Directive({
  selector: '[tomaTypeColor]',
  standalone: false,
})
export class TypeColorDirective implements OnChanges {
  @Input() tomaTypeColor: number;
  @Input() typeColors: TypeColorMap;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tomaTypeColor'] || changes['typeColors']) {
      this.applyColors();
    }
  }

  private applyColors(): void {
    if (this.typeColors && this.tomaTypeColor !== undefined && this.tomaTypeColor !== null) {
      const colors = this.typeColors[this.tomaTypeColor];

      if (colors) {
        this.renderer.setStyle(this.el.nativeElement, 'background-color', colors.bgColor);
        this.renderer.setStyle(this.el.nativeElement, 'color', colors.textColor);
      } else {
        // Fallback if no color mapping exists
        this.renderer.setStyle(this.el.nativeElement, 'background-color', 'transparent');
        this.renderer.setStyle(this.el.nativeElement, 'color', '#000000');
      }
    }
  }
}
