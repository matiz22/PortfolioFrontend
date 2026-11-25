import { Injectable } from '@angular/core';

interface MotionRegistration {
  resume(): void;
  pause(): void;
}

/** Scoped to the cached home view, which can leave the outlet without being destroyed. */
@Injectable()
export class HomeMotionLifecycle {
  private readonly registrations = new Set<MotionRegistration>();
  private attached = true;

  get isAttached(): boolean {
    return this.attached;
  }

  register(registration: MotionRegistration): () => void {
    this.registrations.add(registration);
    return () => this.registrations.delete(registration);
  }

  attach(): void {
    if (this.attached) return;
    this.attached = true;
    for (const registration of this.registrations) {
      registration.resume();
    }
  }

  detach(): void {
    if (!this.attached) return;
    this.attached = false;
    for (const registration of Array.from(this.registrations).reverse()) {
      registration.pause();
    }
  }
}
