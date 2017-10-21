import { Directive, ElementRef, Renderer} from "@angular/core";
@Directive({
    selector: "[ModFocus]"
})

export class ModalFocusDirective {
    constructor(private _el: ElementRef, private renderer: Renderer) {
        this.renderer.invokeElementMethod(this._el.nativeElement, "focus");
    }

}