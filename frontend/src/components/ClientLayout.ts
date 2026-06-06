import { SidebarLayout, type SidebarLayoutOptions } from './SidebarLayout';

export type ClientLayoutOptions = SidebarLayoutOptions;

export function ClientLayout(
  content: HTMLElement,
  options: ClientLayoutOptions = {}
): HTMLElement {
  return SidebarLayout(content, options);
}
