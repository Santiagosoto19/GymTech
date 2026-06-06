import { SidebarLayout } from './SidebarLayout';

export interface LayoutOptions {
  embedded?: boolean;
}

export function Layout(
  title: string,
  content: HTMLElement,
  subtitle = '',
  _options: LayoutOptions = {}
): HTMLElement {
  return SidebarLayout(content, {
    pageTitle: title,
    pageSubtitle: subtitle,
  });
}
