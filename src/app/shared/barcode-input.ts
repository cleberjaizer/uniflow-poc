import {
  Component,
  ElementRef,
  OnDestroy,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { CameraService } from '../core/camera.service';

/**
 * Barcode entry: a text box (works with USB/Bluetooth scanners, which type the digits and press Enter,
 * or manual typing) plus an optional camera scanner for mobile devices.
 */
@Component({
  selector: 'app-barcode-input',
  imports: [FormsModule, TranslocoPipe],
  templateUrl: './barcode-input.html',
})
export class BarcodeInput implements OnDestroy {
  private camera = inject(CameraService);
  scanned = output<string>();
  /** Emits true when camera starts, false when camera stops. */
  cameraActive = output<boolean>();
  /** Stop the camera after the first successful read (used when registering a single item). */
  autoStop = input(false);
  /** Label of the submit button for the typed code. */
  submitKey = input('actions.confirm');
  /** Hide the text input and submit button while the camera scanner is active. */
  hideInputWhenCameraOn = input(false);
  /** Disable the barcode input and buttons. */
  disabled = input(false);
  /** Whether the submit button is allowed to be enabled (in addition to having non-empty code). */
  canSubmit = input(true);
  /** Whether the camera toggle button should be visible. */
  showCameraButton = input(true);
  code = signal('');
  cameraOn = signal(false);
  cameraError = signal(false);
  private video = viewChild.required<ElementRef<HTMLVideoElement>>('video');
  private controls?: { stop: () => void };
  private lastCode = '';
  private lastAt = 0;

  submit() {
    if (this.disabled() || !this.canSubmit()) return;
    const v = this.code().trim();
    if (!v) return;
    this.scanned.emit(v);
    this.code.set('');
  }

  async start() {
    this.cameraError.set(false);
    this.lastCode = '';
    this.lastAt = 0;
    try {
      // Loaded on demand: the scanner library is large and only needed when the camera is used.
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const reader = new BrowserMultiFormatReader();
      this.cameraOn.set(true);
      this.cameraActive.emit(true);
      const selectedDeviceId = this.camera.selectedId() || undefined;
      this.controls = await reader.decodeFromVideoDevice(
        selectedDeviceId,
        this.video().nativeElement,
        (result) => {
          if (!result) return;
          const text = result.getText();
          const now = Date.now();
          if (text === this.lastCode && now - this.lastAt < 2500) return; // ignore repeat reads
          this.lastCode = text;
          this.lastAt = now;
          this.scanned.emit(text);
          if (this.autoStop()) this.stop();
        },
      );
      void this.camera.refreshDevices();
    } catch {
      this.cameraOn.set(false);
      this.cameraError.set(true);
    }
  }

  stop() {
    this.controls?.stop();
    this.controls = undefined;
    this.cameraOn.set(false);
    this.cameraActive.emit(false);
  }

  reset() {
    this.stop();
    this.code.set('');
    this.cameraError.set(false);
  }

  ngOnDestroy() {
    this.stop();
  }
}
