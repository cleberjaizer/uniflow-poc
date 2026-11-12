import { Component, ElementRef, OnDestroy, computed, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../core/auth.service';
import { CameraService } from '../../core/camera.service';
import { DataService } from '../../core/data.service';
import { LANGS, LangService } from '../../core/lang.service';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, TranslocoPipe],
  template: `
    <h1 class="mb-4 text-2xl font-bold">{{ 'settings.title' | transloco }}</h1>

    <div class="max-w-2xl space-y-6">
      <!-- Language settings card -->
      <section class="card space-y-4">
        <div>
          <h2 class="text-lg font-semibold">{{ 'settings.language' | transloco }}</h2>
          <p class="text-sm text-slate-500">{{ 'settings.languageDesc' | transloco }}</p>
        </div>

        <div class="grid gap-2 sm:grid-cols-3">
          @for (l of langs; track l.code) {
            <button
              type="button"
              class="flex items-center justify-between rounded-lg border p-3 text-left transition"
              [class]="
                lang.active === l.code
                  ? 'border-brand-600 bg-brand-50 font-semibold text-brand-700 ring-1 ring-brand-600'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              "
              (click)="lang.set(l.code)"
            >
              <span>{{ l.label }}</span>
              @if (lang.active === l.code) {
                <span class="font-bold text-brand-600" aria-hidden="true">✔</span>
              }
            </button>
          }
        </div>
      </section>

      <!-- Account info card -->
      @if (auth.user(); as u) {
        <section class="card space-y-3">
          <h2 class="text-lg font-semibold">{{ 'settings.account' | transloco }}</h2>

          <div class="space-y-2 text-sm">
            <div class="flex justify-between border-b border-slate-100 pb-2">
              <span class="text-slate-500">{{ 'materials.name' | transloco }}</span>
              <span class="font-medium text-slate-900">{{ u.name }}</span>
            </div>
            <div class="flex justify-between border-b border-slate-100 pb-2">
              <span class="text-slate-500">{{ 'login.email' | transloco }}</span>
              <span class="font-mono text-xs text-slate-900">{{ u.email }}</span>
            </div>
            <div class="flex items-center justify-between pt-1">
              <span class="text-slate-500">{{ 'settings.role' | transloco }}</span>
              <span class="badge bg-brand-100 font-semibold text-brand-700">
                {{ 'role.' + u.role | transloco }}
              </span>
            </div>
          </div>
        </section>
      }

      <!-- Camera settings card -->
      <section class="card space-y-4">
        <div>
          <h2 class="text-lg font-semibold">{{ 'settings.camera' | transloco }}</h2>
          <p class="text-sm text-slate-500">{{ 'settings.cameraDesc' | transloco }}</p>
        </div>

        <div class="space-y-2 text-sm">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <span class="text-slate-500">{{ 'settings.cameraCurrent' | transloco }}</span>
            <span class="font-medium text-slate-900">{{ currentCameraLabel() }}</span>
          </div>
        </div>

        <label class="block text-sm font-medium">
          {{ 'settings.cameraSelect' | transloco }}
          <select
            class="input mt-1"
            [ngModel]="camera.selectedId()"
            (ngModelChange)="onCameraChange($event)"
            (focus)="ensureDevices()"
          >
            <option value="">{{ 'settings.cameraDefault' | transloco }}</option>
            @for (d of camera.devices(); track d.deviceId; let i = $index) {
              <option [value]="d.deviceId">
                {{ d.label || ('settings.cameraDevice' | transloco) + ' ' + (i + 1) }}
              </option>
            }
          </select>
        </label>

        <div>
          <button
            type="button"
            class="btn btn-secondary w-full sm:w-auto"
            (click)="previewOn() ? stopPreview() : startPreview()"
          >
            📷 {{ (previewOn() ? 'settings.stopPreview' : 'settings.previewCamera') | transloco }}
          </button>
        </div>

        @if (previewError()) {
          <p class="text-sm text-red-600">{{ 'actions.cameraError' | transloco }}</p>
        }

        <video
          #previewVideo
          class="aspect-video w-full max-w-md rounded-xl bg-black object-cover"
          [class.hidden]="!previewOn()"
          playsinline
          muted
        ></video>
      </section>

      <!-- Demo data card (admin only) -->
      @if (auth.isAdmin()) {
        <section class="card space-y-4">
          <h2 class="text-lg font-semibold">{{ 'settings.reset' | transloco }}</h2>
          @if (!confirmingReset()) {
            <div>
              <button type="button" class="btn btn-primary" (click)="confirmingReset.set(true)">
                {{ 'common.resetDemo' | transloco }}
              </button>
            </div>
          } @else {
            <div class="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p class="font-medium">{{ 'settings.resetConfirm' | transloco }}</p>
              <div class="flex gap-2">
                <button type="button" class="btn btn-primary" (click)="confirmReset()">
                  {{ 'actions.confirm' | transloco }}
                </button>
                <button type="button" class="btn btn-secondary" (click)="confirmingReset.set(false)">
                  {{ 'materials.cancel' | transloco }}
                </button>
              </div>
            </div>
          }
        </section>
      }

      <!-- About card -->
      <section class="card space-y-2 text-sm text-slate-500">
        <h2 class="text-base font-semibold text-slate-800">{{ 'settings.about' | transloco }}</h2>
        <p>UniFlow POC &bull; {{ 'settings.version' | transloco }} 0.1.0</p>
      </section>
    </div>
  `,
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

  currentCameraLabel = computed(() => {
    this.activeLang();
    const id = this.camera.selectedId();
    if (!id) return this.transloco.translate('settings.cameraDefault');
    const idx = this.camera.devices().findIndex((d) => d.deviceId === id);
    if (idx === -1) return this.transloco.translate('settings.cameraDefault');
    const dev = this.camera.devices()[idx];
    return dev.label || `${this.transloco.translate('settings.cameraDevice')} ${idx + 1}`;
  });

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
