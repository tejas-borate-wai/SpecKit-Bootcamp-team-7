import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appMinTapTarget]',
  standalone: true,
})
export class MinTapTargetDirective implements AfterViewInit {
  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    const element = this.el.nativeElement;
    const styles = window.getComputedStyle(element);
    const width = parseFloat(styles.width);
    const height = parseFloat(styles.height);

    if (width < 44) {
      element.style.minWidth = '44px';
    }
    if (height < 44) {
      element.style.minHeight = '44px';
    }
  }
}
