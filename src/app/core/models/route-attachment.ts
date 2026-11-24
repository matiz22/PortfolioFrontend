/** Hooks for retained router views, whose detach does not destroy their children. */
export interface RouteAttachment {
  onRouteAttach(): void;
  onRouteDetach(): void;
}

export function notifyRouteAttachment(component: unknown, hook: keyof RouteAttachment): void {
  if (component && typeof component === 'object' && hook in component) {
    const callback = (component as Partial<RouteAttachment>)[hook];
    if (typeof callback === 'function') callback.call(component);
  }
}
