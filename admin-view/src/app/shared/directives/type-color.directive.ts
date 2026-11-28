import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges, inject } from '@angular/core';
import { TypeColorMap } from '../../settings/settings.model';

@Directive({ selector: '[tomaTypeColor]' })
export class TypeColorDirective implements OnChanges {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  /** The discipline id whose colors to apply; nothing changes without one. */
  @Input({ required: true }) tomaTypeColor: number | null | undefined;
  /** Null while the colors are not loaded: the element is left alone. */
  @Input() typeColors: TypeColorMap | null = {};

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
