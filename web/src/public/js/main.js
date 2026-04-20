const componentRegistry = {
  'marketplace-hero': '/components/marketplace-hero.js',
  'marketplace-search-bar': '/components/marketplace-search-bar.js',
  'marketplace-item-card': '/components/marketplace-item-card.js',
  'marketplace-item-grid': '/components/marketplace-item-grid.js',
  'marketplace-item-detail': '/components/marketplace-item-detail.js',
  'marketplace-offer-panel': '/components/marketplace-offer-panel.js',
  'marketplace-chat-thread': '/components/marketplace-chat-thread.js',
  'marketplace-checkout-panel': '/components/marketplace-checkout-panel.js',
  'marketplace-seller-summary': '/components/marketplace-seller-summary.js',
  'marketplace-seller-items': '/components/marketplace-seller-items.js'
};

const getLitRoots = () => Array.from(document.querySelectorAll('[data-lit-root]'));

const getTagNameFromRoot = (root) => {
  const element = root.firstElementChild;
  return element ? element.tagName.toLowerCase() : null;
};

const loadComponentsForPage = async (roots) => {
  const tags = [...new Set(roots.map(getTagNameFromRoot).filter(Boolean))];

  for (const tag of tags) {
    const modulePath = componentRegistry[tag];

    if (!modulePath) {
      console.warn(`No module registered for component tag: ${tag}`);
      continue;
    }

    try {
      await import(modulePath);
      console.log(`Loaded component: ${tag}`);
    } catch (error) {
      console.error(`Failed to load component module for ${tag}:`, error);
    }
  }
};

const applyPropsToComponents = (roots) => {
  roots.forEach((root) => {
    const element = root.firstElementChild;
    const propsScript = root.querySelector('.component-props');

    if (!element || !propsScript) return;

    try {
      const props = JSON.parse(propsScript.textContent || '{}');

      Object.entries(props).forEach(([key, value]) => {
        element[key] = value;
      });
    } catch (error) {
      console.error('Failed to parse component props:', error);
    }
  });
};

const bootstrapLitComponents = async () => {
  const roots = getLitRoots();

  console.log(`Found ${roots.length} Lit host(s) on page`);

  await loadComponentsForPage(roots);
  applyPropsToComponents(roots);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapLitComponents);
} else {
  bootstrapLitComponents();
}