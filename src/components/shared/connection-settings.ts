import { h } from '../../lib/dom';
import { icons } from '../../lib/icons';
import { openAuthModal } from '../modals/auth-modal';
import { isSchemeConfigured } from '../modals/auth-modal';
import { createCard, createButton, createSection } from '../ui';
import type { SecurityScheme } from '../../core/types';

export function createConnectionSettingsSections(
  securitySchemes: Record<string, SecurityScheme>,
  portalRoot?: HTMLElement,
): HTMLElement[] {
  const sections: HTMLElement[] = [];

  const authSection = createAuthenticationSection(securitySchemes, portalRoot);
  if (authSection) sections.push(authSection);

  return sections;
}

function createAuthenticationSection(
  securitySchemes: Record<string, SecurityScheme>,
  portalRoot?: HTMLElement,
): HTMLElement | null {
  if (Object.keys(securitySchemes).length === 0) return null;

  const authSection = createSection({ title: 'Authentication' });

  for (const [name, scheme] of Object.entries(securitySchemes)) {
    const configured = isSchemeConfigured(name);
    const card = createCard({ className: 'card-group card-auth' });

    const top = h('div', { className: 'card-auth-main' });

    const info = h('div', { className: 'card-info card-auth-info' });
    const typeText = `${scheme.type}${scheme.scheme ? ` / ${scheme.scheme}` : ''}`;
    info.append(
      h('h3', { textContent: name }),
      h('p', { className: 'card-auth-type', textContent: typeText }),
    );

    if (scheme.description) {
      info.append(h('p', { className: 'card-auth-desc', textContent: String(scheme.description) }));
    }

    const configureBtn = createButton({
      variant: 'secondary',
      icon: configured ? icons.check : icons.settings,
      label: configured ? 'Success' : 'Set',
      className: `card-auth-config${configured ? ' active is-configured' : ''}`,
      onClick: (event) => {
        event.stopPropagation();
        openAuthModal(securitySchemes, portalRoot, name);
      },
    });

    top.append(info);
    card.append(top, configureBtn);

    authSection.append(card);
  }

  return authSection;
}
