import { Injectable, signal } from '@angular/core';

const KEY = 'uniflow.camera';

export interface CameraDevice {
  deviceId: string;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class CameraService {
  /** Empty string means the browser's default camera is used. */
  readonly selectedId = signal<string>(this.read());
  readonly devices = signal<CameraDevice[]>([]);

  select(deviceId: string) {
    this.selectedId.set(deviceId);
    try {
      if (deviceId) {
        localStorage.setItem(KEY, deviceId);
      } else {
        localStorage.removeItem(KEY);
      }
    } catch {}
  }

  async refreshDevices(requestPermission = false): Promise<CameraDevice[]> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      return [];
    }
    try {
      let all = await navigator.mediaDevices.enumerateDevices();
      let videoInputs = all.filter((d) => d.kind === 'videoinput' && !!d.deviceId);

      // On mobile browsers, device labels and additional cameras are hidden until permission is granted.
      if (
        requestPermission &&
        navigator.mediaDevices.getUserMedia &&
        (videoInputs.length === 0 || videoInputs.every((d) => !d.label))
      ) {
        try {
          const tempStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          tempStream.getTracks().forEach((t) => t.stop());
          all = await navigator.mediaDevices.enumerateDevices();
          videoInputs = all.filter((d) => d.kind === 'videoinput' && !!d.deviceId);
        } catch {}
      }

      const mapped = videoInputs.map((d) => ({
        deviceId: d.deviceId,
        label: d.label.trim(),
      }));
      this.devices.set(mapped);

      const current = this.selectedId();
      if (current && mapped.length > 0 && !mapped.some((d) => d.deviceId === current)) {
        this.select('');
      }
      return mapped;
    } catch {
      return [];
    }
  }

  private read(): string {
    try {
      return localStorage.getItem(KEY) ?? '';
    } catch {
      return '';
    }
  }
}
