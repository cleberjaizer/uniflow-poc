import {
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../core/auth.service';
import { CameraDevice, CameraService } from '../../core/camera.service';
import { DataService } from '../../core/data.service';
import { LANGS, LangService } from '../../core/lang.service';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, TranslocoPipe],
  templateUrl: './settings.html',
})
export class Settings implements OnDestroy {
  auth = inject(AuthService);
  camera = inject(CameraService);
  data = inject(DataService);
  lang = inject(LangService);
  private router = inject(Router);
  private transloco = inject(TranslocoService);
  private activeLang = toSignal(this.transloco.langChanges$);
  private previewVideo = viewChild.required<ElementRef<HTMLVideoElement>>('previewVideo');
  private stream?: MediaStream;

  langs = LANGS;
  confirmingReset = signal(false);
  previewOn = signal(false);
  previewError = signal(false);

  cameraOptions = computed(() => {
    this.activeLang();
    return this.camera.devices().map((d, i) => ({
      deviceId: d.deviceId,
      displayLabel: this.formatCameraLabel(d, i),
    }));
  });

  currentCameraLabel = computed(() => {
    const id = this.camera.selectedId();
    if (!id) {
      this.activeLang();
      return this.transloco.translate('settings.cameraDefault');
    }
    const found = this.cameraOptions().find((d) => d.deviceId === id);
    return found ? found.displayLabel : this.transloco.translate('settings.cameraDefault');
  });

  private formatCameraLabel(d: CameraDevice, index: number): string {
    if (!this.camera.isMobile) {
      return d.label || `${this.transloco.translate('settings.cameraDevice')} ${index + 1}`;
    }
    if (d.facing === 'back') {
      const base = this.transloco.translate('settings.cameraBack');
      return d.facingTotal > 1 ? `${base} ${d.facingIndex}` : base;
    }
    if (d.facing === 'front') {
      const base = this.transloco.translate('settings.cameraFront');
      return d.facingTotal > 1 ? `${base} ${d.facingIndex}` : base;
    }
    return `${this.transloco.translate('settings.cameraDevice')} ${index + 1}`;
  }

  constructor() {
    void this.camera.refreshDevices();
  }

  async ensureDevices() {
    const list = this.camera.devices();
    if (list.length === 0 || list.every((d) => !d.label)) {
      await this.camera.refreshDevices(true);
    }
  }

  onCameraChange(deviceId: string) {
    this.camera.select(deviceId);
    if (this.previewOn()) {
      void this.startPreview();
    }
  }

  async startPreview() {
    this.stopStream();
    this.previewError.set(false);
    try {
      const deviceId = this.camera.selectedId();
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false,
      };
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      await this.camera.refreshDevices();
      const videoEl = this.previewVideo().nativeElement;
      videoEl.srcObject = this.stream;
      this.previewOn.set(true);
      await videoEl.play();
    } catch {
      this.stopPreview();
      this.previewError.set(true);
    }
  }

  stopPreview() {
    this.stopStream();
    const videoEl = this.previewVideo()?.nativeElement;
    if (videoEl) {
      videoEl.srcObject = null;
    }
    this.previewOn.set(false);
  }

  private stopStream() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = undefined;
  }

  confirmReset() {
    this.stopPreview();
    this.data.resetDemo();
    this.confirmingReset.set(false);
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    this.stopPreview();
  }
}
