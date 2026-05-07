const symbolSelector = '.material-symbols-outlined';

type IconPath = string | string[];

const commonPaths: Record<string, IconPath> = {
  account_balance: [
    '<path d="M3 10h18"/>',
    '<path d="M5 10 12 5l7 5"/>',
    '<path d="M6 10v8"/>',
    '<path d="M10 10v8"/>',
    '<path d="M14 10v8"/>',
    '<path d="M18 10v8"/>',
    '<path d="M4 18h16"/>',
  ],
  account_balance_wallet: [
    '<path d="M4 7h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h12"/>',
    '<path d="M16 13h5"/>',
    '<circle cx="17" cy="13" r="1"/>',
  ],
  account_circle: [
    '<circle cx="12" cy="12" r="9"/>',
    '<circle cx="12" cy="10" r="3"/>',
    '<path d="M7 19c1.2-2.4 3-3.6 5-3.6s3.8 1.2 5 3.6"/>',
  ],
  add: ['<path d="M12 5v14"/>', '<path d="M5 12h14"/>'],
  add_photo_alternate: [
    '<rect x="4" y="5" width="16" height="14" rx="2"/>',
    '<circle cx="9" cy="10" r="1.5"/>',
    '<path d="m7 17 4-4 3 3 2-2 3 3"/>',
    '<path d="M18 3v4"/>',
    '<path d="M16 5h4"/>',
  ],
  add_shopping_cart: [
    '<circle cx="9" cy="20" r="1"/>',
    '<circle cx="18" cy="20" r="1"/>',
    '<path d="M2 3h3l2.2 11.5a2 2 0 0 0 2 1.5h8.7a2 2 0 0 0 2-1.5L21 8H7"/>',
    '<path d="M15 4v6"/>',
    '<path d="M12 7h6"/>',
  ],
  admin_panel_settings: [
    '<path d="M12 3 5 6v5c0 4.5 3 8.2 7 10 4-1.8 7-5.5 7-10V6l-7-3Z"/>',
    '<path d="M9.5 12.5 11 14l3.5-4"/>',
  ],
  analytics: [
    '<path d="M4 19V5"/>',
    '<path d="M4 19h16"/>',
    '<path d="M8 16v-5"/>',
    '<path d="M12 16V8"/>',
    '<path d="M16 16v-9"/>',
  ],
  arrow_back: '<path d="M19 12H5m7-7-7 7 7 7"/>',
  arrow_forward: '<path d="M5 12h14m-7-7 7 7-7 7"/>',
  badge: [
    '<rect x="5" y="4" width="14" height="16" rx="2"/>',
    '<circle cx="12" cy="10" r="2"/>',
    '<path d="M8 16h8"/>',
  ],
  broadcast_on_personal: [
    '<path d="M4 9a8 8 0 0 1 16 0"/>',
    '<path d="M7 10a5 5 0 0 1 10 0"/>',
    '<path d="M10 11a2 2 0 0 1 4 0"/>',
    '<path d="M12 13v6"/>',
  ],
  calendar_today: [
    '<rect x="4" y="5" width="16" height="15" rx="2"/>',
    '<path d="M8 3v4"/>',
    '<path d="M16 3v4"/>',
    '<path d="M4 10h16"/>',
  ],
  call: [
    '<path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.4 2.7a2 2 0 0 1-.6 1.8L7.8 9.3a16 16 0 0 0 6.9 6.9l1.1-1.1a2 2 0 0 1 1.8-.6l2.7.4a2 2 0 0 1 1.7 2Z"/>',
  ],
  category: [
    '<rect x="4" y="4" width="7" height="7" rx="1"/>',
    '<rect x="13" y="4" width="7" height="7" rx="1"/>',
    '<rect x="4" y="13" width="7" height="7" rx="1"/>',
    '<rect x="13" y="13" width="7" height="7" rx="1"/>',
  ],
  chat: ['<path d="M21 12a8 8 0 0 1-8 8H6l-3 2 1-5a8 8 0 1 1 17-5Z"/>'],
  check: '<path d="m5 12 4 4L19 6"/>',
  check_circle: ['<circle cx="12" cy="12" r="9"/>', '<path d="m8 12 3 3 5-6"/>'],
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  cloud_off: [
    '<path d="m2 2 20 20"/>',
    '<path d="M17.5 17H8a5 5 0 0 1-1.6-9.7A6 6 0 0 1 18 8.7a4.5 4.5 0 0 1 1.2 8.3"/>',
  ],
  contactless: [
    '<path d="M7 9a5 5 0 0 1 0 6"/>',
    '<path d="M11 7a8 8 0 0 1 0 10"/>',
    '<path d="M15 5a11 11 0 0 1 0 14"/>',
    '<path d="M4 12h.01"/>',
  ],
  credit_card: [
    '<rect x="3" y="5" width="18" height="14" rx="2"/>',
    '<path d="M3 10h18"/>',
    '<path d="M7 15h4"/>',
  ],
  cruelty_free: [
    '<circle cx="9" cy="7" r="2"/>',
    '<circle cx="15" cy="7" r="2"/>',
    '<path d="M7 13c0-2.2 2.2-4 5-4s5 1.8 5 4v4a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3v-4Z"/>',
    '<path d="M10 14h.01M14 14h.01"/>',
  ],
  dark_mode: '<path d="M21 13.2A8 8 0 1 1 10.8 3a6.5 6.5 0 0 0 10.2 10.2Z"/>',
  delete: [
    '<path d="M4 7h16"/>',
    '<path d="M10 11v6"/>',
    '<path d="M14 11v6"/>',
    '<path d="M6 7l1 14h10l1-14"/>',
    '<path d="M9 7V4h6v3"/>',
  ],
  deployed_code: [
    '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/>',
    '<path d="M12 12 4 7.5"/>',
    '<path d="m12 12 8-4.5"/>',
    '<path d="M12 12v9"/>',
  ],
  description: [
    '<path d="M6 3h9l3 3v15H6V3Z"/>',
    '<path d="M14 3v4h4"/>',
    '<path d="M9 12h6"/>',
    '<path d="M9 16h6"/>',
  ],
  done_all: ['<path d="m2 13 4 4L16 7"/>', '<path d="m9 13 4 4L22 7"/>'],
  drafts: ['<path d="M4 7h16v12H4z"/>', '<path d="m4 8 8 6 8-6"/>'],
  dynamic_feed: [
    '<rect x="4" y="5" width="10" height="10" rx="2"/>',
    '<path d="M8 19h8a2 2 0 0 0 2-2V9"/>',
  ],
  edit: ['<path d="M12 20h9"/>', '<path d="m16.5 3.5 4 4L8 20H4v-4L16.5 3.5Z"/>'],
  edit_square: [
    '<rect x="4" y="4" width="16" height="16" rx="3"/>',
    '<path d="m14.5 7.5 2 2L10 16H8v-2l6.5-6.5Z"/>',
  ],
  engineering: [
    '<circle cx="12" cy="12" r="3"/>',
    '<path d="M12 2v3"/>',
    '<path d="M12 19v3"/>',
    '<path d="M2 12h3"/>',
    '<path d="M19 12h3"/>',
    '<path d="m4.9 4.9 2.1 2.1"/>',
    '<path d="m17 17 2.1 2.1"/>',
    '<path d="m19.1 4.9-2.1 2.1"/>',
    '<path d="m7 17-2.1 2.1"/>',
  ],
  error: ['<circle cx="12" cy="12" r="9"/>', '<path d="M12 7v6"/>', '<path d="M12 17h.01"/>'],
  explore: ['<circle cx="12" cy="12" r="9"/>', '<path d="m15 9-2 6-6 2 2-6 6-2Z"/>'],
  fingerprint: [
    '<path d="M12 11a3 3 0 0 0-3 3c0 2-.5 3.5-1.5 5"/>',
    '<path d="M12 11a3 3 0 0 1 3 3c0 2 .5 3.5 1.5 5"/>',
    '<path d="M6 10a7 7 0 0 1 12 0"/>',
    '<path d="M9 21c.8-1.2 1-2.8 1-5"/>',
  ],
  forum: ['<path d="M4 6h16v10H7l-3 3V6Z"/>', '<path d="M8 10h8"/>', '<path d="M8 13h5"/>'],
  group: [
    '<path d="M16 11a3 3 0 1 0-3-3"/>',
    '<circle cx="9" cy="8" r="3"/>',
    '<path d="M2 20c.8-3 3.2-5 7-5s6.2 2 7 5"/>',
    '<path d="M16 14c2.5.4 4.2 2.1 5 4"/>',
  ],
  home: ['<path d="M3 11 12 4l9 7"/>', '<path d="M5 10v10h14V10"/>', '<path d="M10 20v-6h4v6"/>'],
  inventory_2: [
    '<path d="M4 7h16"/>',
    '<path d="M6 7v13h12V7"/>',
    '<path d="m8 4 1 3"/>',
    '<path d="m16 4-1 3"/>',
    '<path d="M9 12h6"/>',
  ],
  light_mode: [
    '<circle cx="12" cy="12" r="4"/>',
    '<path d="M12 2v2"/>',
    '<path d="M12 20v2"/>',
    '<path d="M4.9 4.9 6.3 6.3"/>',
    '<path d="M17.7 17.7l1.4 1.4"/>',
    '<path d="M2 12h2"/>',
    '<path d="M20 12h2"/>',
    '<path d="m4.9 19.1 1.4-1.4"/>',
    '<path d="m17.7 6.3 1.4-1.4"/>',
  ],
  login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  mail: ['<rect x="3" y="5" width="18" height="14" rx="2"/>', '<path d="m3 7 9 7 9-7"/>'],
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  newspaper: [
    '<path d="M4 5h13v14H4z"/>',
    '<path d="M17 8h3v11a2 2 0 0 1-2 2"/>',
    '<path d="M7 9h6"/>',
    '<path d="M7 13h6"/>',
    '<path d="M7 17h4"/>',
  ],
  pets: [
    '<circle cx="8" cy="8" r="2"/>',
    '<circle cx="16" cy="8" r="2"/>',
    '<circle cx="6" cy="14" r="2"/>',
    '<circle cx="18" cy="14" r="2"/>',
    '<path d="M9 17c0-2 1.5-3.5 3-3.5s3 1.5 3 3.5a3 3 0 0 1-6 0Z"/>',
  ],
  person: ['<circle cx="12" cy="8" r="4"/>', '<path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>'],
  person_add: [
    '<circle cx="10" cy="8" r="4"/>',
    '<path d="M3 21c.8-3.5 3.2-5.5 7-5.5"/>',
    '<path d="M18 8v8"/>',
    '<path d="M14 12h8"/>',
  ],
  radar: [
    '<circle cx="12" cy="12" r="8"/>',
    '<circle cx="12" cy="12" r="4"/>',
    '<path d="m12 12 6-6"/>',
  ],
  refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v6h-6"/>',
  rocket: [
    '<path d="M6 15c-1.5 1.3-2 3-2 5 2 0 3.7-.5 5-2"/>',
    '<path d="m9 15-2-.5L4 17l3 3 2.5-3"/>',
    '<path d="M9 15 15 9"/>',
    '<path d="M15 9l4-4c1.1-1.1 2.3-1.6 3-1 .6.7.1 1.9-1 3l-4 4"/>',
    '<path d="m15 9 2 6-2 2-3-5"/>',
  ],
  rocket_launch: [
    '<path d="M6 15c-1.5 1.3-2 3-2 5 2 0 3.7-.5 5-2"/>',
    '<path d="m9 15-2-.5L4 17l3 3 2.5-3"/>',
    '<path d="M9 15 15 9"/>',
    '<path d="M15 9l4-4c1.1-1.1 2.3-1.6 3-1 .6.7.1 1.9-1 3l-4 4"/>',
    '<path d="m15 9 2 6-2 2-3-5"/>',
  ],
  satellite_alt: [
    '<path d="m13 5 6 6-8 8-6-6 8-8Z"/>',
    '<path d="m5 19 3-3"/>',
    '<path d="m19 5-3 3"/>',
    '<path d="M4 4h.01"/>',
  ],
  science: [
    '<path d="M10 2v6L5 19a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3L14 8V2"/>',
    '<path d="M8 2h8"/>',
    '<path d="M7 16h10"/>',
  ],
  search: ['<circle cx="11" cy="11" r="7"/>', '<path d="m21 21-4.3-4.3"/>'],
  search_off: [
    '<path d="m2 2 20 20"/>',
    '<circle cx="11" cy="11" r="7"/>',
    '<path d="m21 21-4.3-4.3"/>',
  ],
  security: ['<path d="M12 3 5 6v5c0 4.5 3 8.2 7 10 4-1.8 7-5.5 7-10V6l-7-3Z"/>'],
  send: '<path d="m22 2-7 20-4-9-9-4 20-7Z"/>',
  sensors: [
    '<path d="M4 12a8 8 0 0 1 8-8"/>',
    '<path d="M4 12a8 8 0 0 0 8 8"/>',
    '<path d="M20 12a8 8 0 0 0-8-8"/>',
    '<path d="M20 12a8 8 0 0 1-8 8"/>',
    '<circle cx="12" cy="12" r="2"/>',
  ],
  settings_input_antenna: [
    '<path d="M12 12v8"/>',
    '<circle cx="12" cy="10" r="2"/>',
    '<path d="M8 7a6 6 0 0 1 8 0"/>',
    '<path d="M5 4a10 10 0 0 1 14 0"/>',
  ],
  shield: ['<path d="M12 3 5 6v5c0 4.5 3 8.2 7 10 4-1.8 7-5.5 7-10V6l-7-3Z"/>'],
  shopping_basket: [
    '<path d="M4 10h16l-2 10H6L4 10Z"/>',
    '<path d="m8 10 4-6 4 6"/>',
    '<path d="M9 15v2"/>',
    '<path d="M15 15v2"/>',
  ],
  shopping_cart: [
    '<circle cx="9" cy="20" r="1"/>',
    '<circle cx="18" cy="20" r="1"/>',
    '<path d="M2 3h3l2.2 11.5a2 2 0 0 0 2 1.5h8.7a2 2 0 0 0 2-1.5L21 8H7"/>',
  ],
  storefront: [
    '<path d="M4 10h16"/>',
    '<path d="M5 10l1-5h12l1 5"/>',
    '<path d="M6 10v10h12V10"/>',
    '<path d="M9 20v-6h6v6"/>',
  ],
  support_agent: [
    '<circle cx="12" cy="12" r="8"/>',
    '<path d="M4 12h3"/>',
    '<path d="M17 12h3"/>',
    '<path d="M9 17h3a5 5 0 0 0 5-5"/>',
  ],
  sync: '<path d="M21 12a9 9 0 0 1-14.6 7M3 12A9 9 0 0 1 17.6 5M17 5h4V1M7 19H3v4"/>',
  warning: ['<path d="m12 3 10 18H2L12 3Z"/>', '<path d="M12 9v5"/>', '<path d="M12 18h.01"/>'],
  wifi_off: [
    '<path d="m2 2 20 20"/>',
    '<path d="M5 13a10 10 0 0 1 10-4"/>',
    '<path d="M8.5 16.5a5 5 0 0 1 7 0"/>',
  ],
  wifi_tethering: [
    '<circle cx="12" cy="12" r="2"/>',
    '<path d="M8 8a6 6 0 0 1 8 8"/>',
    '<path d="M5 5a10 10 0 0 1 14 14"/>',
  ],
};

const aliases: Record<string, string> = {
  adjust: 'radar',
  computer: 'inventory_2',
  enhanced_encryption: 'security',
  farsight_2: 'radar',
  format_quote: 'description',
  gavel: 'account_balance',
  groups: 'group',
  hardware: 'engineering',
  headset_mic: 'support_agent',
  history_edu: 'newspaper',
  how_to_reg: 'check_circle',
  image_not_supported: 'cloud_off',
  info: 'error',
  key: 'security',
  keyboard_double_arrow_down: 'arrow_forward',
  keyboard_double_arrow_up: 'arrow_back',
  location_on: 'radar',
  lock: 'security',
  lock_open: 'security',
  lock_reset: 'security',
  map: 'radar',
  mark_email_read: 'drafts',
  move_to_inbox: 'inventory_2',
  nutrition: 'pets',
  person_pin_circle: 'account_circle',
  priority_high: 'warning',
  query_stats: 'analytics',
  receipt_long: 'description',
  remove: 'close',
  reply: 'arrow_back',
  save: 'check',
  scale: 'account_balance',
  schedule: 'calendar_today',
  security_update_warning: 'warning',
  shield_person: 'admin_panel_settings',
  shopping_cart_checkout: 'shopping_cart',
  space_dashboard: 'category',
  subject: 'description',
  thermostat: 'settings_input_antenna',
  thumb_down: 'close',
  thumb_up: 'add',
  token: 'deployed_code',
  verified: 'check_circle',
  verified_user: 'admin_panel_settings',
};

function symbolName(element: Element): string {
  return (element.getAttribute('data-icon') || element.textContent || '').trim();
}

function iconSvg(icon: string): string {
  const resolved = aliases[icon] ?? icon;
  const paths = commonPaths[resolved] ?? [
    '<circle cx="12" cy="12" r="7"/>',
    '<path d="M12 8v8"/>',
    '<path d="M8 12h8"/>',
  ];
  const body = Array.isArray(paths) ? paths.join('') : paths;

  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

function restoreTextFallback(element: HTMLElement): void {
  const icon = element.dataset['icon'];

  if (icon && element.dataset['svgFallback'] === 'true') {
    element.textContent = icon;
  }

  delete element.dataset['svgFallback'];
  delete element.dataset['renderedIcon'];
}

function renderSvgFallback(element: HTMLElement, icon: string): void {
  if (element.dataset['svgFallback'] === 'true' && element.dataset['renderedIcon'] === icon) {
    return;
  }

  element.innerHTML = iconSvg(icon);
  element.dataset['svgFallback'] = 'true';
  element.dataset['renderedIcon'] = icon;
}

function decorateSymbols(root: ParentNode = document, fallbackMode = false): void {
  root.querySelectorAll<HTMLElement>(symbolSelector).forEach((element) => {
    const icon = symbolName(element);

    if (!icon) {
      return;
    }

    if (!element.dataset['icon']) {
      element.dataset['icon'] = icon;
    }

    element.setAttribute('aria-hidden', 'true');

    const currentFallbackSize = element.style.getPropertyValue('--icon-fallback-size');
    if (!currentFallbackSize || currentFallbackSize === '0px') {
      const fontSize = window.getComputedStyle(element).fontSize;
      element.style.setProperty(
        '--icon-fallback-size',
        fontSize === '0px' ? estimatedIconSize(element) : fontSize || '1rem',
      );
    }

    if (fallbackMode) {
      renderSvgFallback(element, element.dataset['icon'] ?? icon);
    } else {
      restoreTextFallback(element);
    }
  });
}

function estimatedIconSize(element: HTMLElement): string {
  const classNames = Array.from(element.classList);
  const explicitSize = classNames
    .find((className) => className.startsWith('text-['))
    ?.match(/text-\[([^\]]+)\]/)?.[1];

  if (explicitSize) {
    return explicitSize;
  }

  const tailwindSizes: Record<string, string> = {
    'text-xs': '0.75rem',
    'text-sm': '0.875rem',
    'text-base': '1rem',
    'text-lg': '1.125rem',
    'text-xl': '1.25rem',
    'text-2xl': '1.5rem',
    'text-3xl': '1.875rem',
    'text-4xl': '2.25rem',
    'text-5xl': '3rem',
    'text-6xl': '3.75rem',
    'text-7xl': '4.5rem',
    'text-8xl': '6rem',
    'text-9xl': '8rem',
  };

  return classNames.reduce((size, className) => tailwindSizes[className] ?? size, '1rem');
}

function materialSymbolsAvailable(): boolean {
  return !!document.fonts?.check('24px "Material Symbols Outlined"');
}

function refreshFallbackMode(): void {
  const fallbackMode = !materialSymbolsAvailable();
  document.documentElement.classList.toggle('icon-fallback', fallbackMode);
  decorateSymbols(document, fallbackMode);
}

export function installMaterialSymbolsFallback(): void {
  if (typeof document === 'undefined') {
    return;
  }

  refreshFallbackMode();

  const observer = new MutationObserver(() => {
    decorateSymbols(document, document.documentElement.classList.contains('icon-fallback'));
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  document.fonts?.ready.then(refreshFallbackMode).catch(() => {
    document.documentElement.classList.add('icon-fallback');
    decorateSymbols(document, true);
  });
}
