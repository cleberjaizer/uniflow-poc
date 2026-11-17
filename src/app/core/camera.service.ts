import { Injectable, signal } from '@angular/core';

const KEY = 'uniflow.camera';

export type CameraFacing = 'back' | 'front' | 'other';

export interface CameraDevice {
  deviceId: string;
  label: string;
  facing: CameraFacing;
  /** 1-based index among cameras of the same facing direction. */
  facingIndex: number;
  /** Total count of cameras sharing the same facing direction. */
  facingTotal: number;
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

      const classified = videoInputs.map((d) => {
        const label = d.label.trim();
        const facing = this.detectFacing(label);
        return { deviceId: d.deviceId, label, facing };
      });

      const totals: Record<CameraFacing, number> = { back: 0, front: 0, other: 0 };
      classified.forEach((c) => totals[c.facing]++);

      const counts: Record<CameraFacing, number> = { back: 0, front: 0, other: 0 };
      const mapped: CameraDevice[] = classified.map((c) => ({
        ...c,
        facingIndex: ++counts[c.facing],
        facingTotal: totals[c.facing],
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

  private detectFacing(label: string): CameraFacing {
    const lower = label.toLowerCase();
    if (/facing\s*back|\bback\b|\brear\b|\benvironment\b|\btraseir[ao]\b|\btraser[ao]\b/.test(lower)) {
      return 'back';
    }
    if (/facing\s*front|\bfront\b|\buser\b|\bselfie\b|\bfrontal\b/.test(lower)) {
      return 'front';
    }
    return 'other';
  }

  private read(): string {
    try {
      return localStorage.getItem(KEY) ?? '';
    } catch {
      return '';
    }
  }
}
