import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appImageFallback]',
  standalone: true
})
export class ImageFallbackDirective implements OnInit {
  @Input() fallbackImage: string = 'https://via.placeholder.com/300x300?text=No+Image';

  constructor(private elementRef: ElementRef<HTMLImageElement>) {}

  ngOnInit(): void {
    this.elementRef.nativeElement.addEventListener('error', () => {
      // If the original image fails to load, use fallback
      this.elementRef.nativeElement.src = this.fallbackImage;
    });

    // Also handle data URLs that might be invalid
    const currentSrc = this.elementRef.nativeElement.src;
    if (currentSrc && currentSrc.startsWith('data:') && currentSrc.length < 100) {
      // If it's a very short data URL (likely a placeholder), use fallback
      this.elementRef.nativeElement.src = this.fallbackImage;
    }
  }
}
