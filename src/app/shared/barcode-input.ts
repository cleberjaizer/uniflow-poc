import { Component, ElementRef, OnDestroy, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

/**
 * Barcode entry: a text box (works with USB/Bluetooth scanners, which type the digits and press Enter,
 * or manual typing) plus an optional camera scanner for mobile devices.
 */
@Component({
  selector: 'app-barcode-input',
  imports: [FormsModule, TranslocoPipe],
  template: `
    <div class="space-y-3">
      <form class="flex gap-2" (ngSubmit)="submit()">
        <input
          class="input"
          name="code"
          autocomplete="off"
          autocapitalize="characters"
          [placeholder]="'actions.typeBarcode' | transloco"
          [(ngModel)]="code"
        />
        <button class="btn btn-primary" type="submit">{{ 'actions.confirm' | transloco }}</button>
      </form>

      <button type="button" class="btn btn-secondary w-full sm:w-auto" (click)="cameraOn() ? stop() : start()">
        📷 {{ (cameraOn() ? 'actions.stopCamera' : 'actions.useCamera') | transloco }}
      </button>

      @if (cameraError()) {
        <p class="text-sm text-red-600">{{ 'actions.cameraError' | transloco }}</p>
      }

      <video
        #video
        class="aspect-video w-full max-w-md rounded-xl bg-black object-cover"
        [class.hidden]="!cameraOn()"
        playsinline
        muted
      ></video>
    </div>
  `,
})
export class BarcodeInput implements OnDestroy {
  scanned = output<string>();
  code = '';
  cameraOn = signal(false);
  cameraError = signal(false);
  private video = viewChild.required<ElementRef<HTMLVideoElement>>('video');
  private controls?: { stop: () => void };
  private lastCode = '';
  private lastAt = 0;

  submit() {
    const v = this.code.trim();
    if (!v) return;
    this.scanned.emit(v);
    this.code = '';
  }

  async start() {
    this.cameraError.set(false);
    try {
      // Loaded on demand: the scanner library is large and only needed when the camera is used.
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const reader = new BrowserMultiFormatReader();
      this.cameraOn.set(true);
      this.controls = await reader.decodeFromVideoDevice(undefined, this.video().nativeElement, (result) => {
        if (!result) return;
        const text = result.getText();
        const now = Date.now();
        if (text === this.lastCode && now - this.lastAt < 2500) return; // ignore repeat reads
        this.lastCode = text;
        this.lastAt = now;
        this.scanned.emit(text);
      });
    } catch {
      this.cameraOn.set(false);
      this.cameraError.set(true);
    }
  }

  stop() {
    this.controls?.stop();
    this.controls = undefined;
    this.cameraOn.set(false);
  }

  ngOnDestroy() {
    this.stop();
  }
}
