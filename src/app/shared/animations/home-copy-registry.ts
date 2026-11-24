import { Injectable } from '@angular/core';

export interface HomeCopyConfig {
  heading: string;
  details?: string;
  effect?: 'mask' | 'wipe' | 'lines' | 'seal';
  duration?: number;
  stagger?: number;
  focusScope?: string;
  keepAtPageEnd?: boolean;
}

export interface HomeCopyRegistration {
  element: HTMLElement;
  config: HomeCopyConfig;
}

interface CopyObserver {
  add(registration: HomeCopyRegistration): void;
  remove(registration: HomeCopyRegistration): void;
}

/** Section-owned registrations persist while the cached home view is detached. */
@Injectable()
export class HomeCopyRegistry {
  private readonly registrations = new Set<HomeCopyRegistration>();
  private readonly observers = new Set<CopyObserver>();

  register(element: HTMLElement, config: HomeCopyConfig): () => void {
    const registration = { element, config };
    this.registrations.add(registration);
    this.observers.forEach((observer) => observer.add(registration));
    return () => {
      if (this.registrations.delete(registration)) {
        this.observers.forEach((observer) => observer.remove(registration));
      }
    };
  }

  subscribe(observer: CopyObserver): () => void {
    this.observers.add(observer);
    Array.from(this.registrations).forEach((registration) => observer.add(registration));
    return () => { this.observers.delete(observer); };
  }
}
