import { LitElement, html, css } from 'lit';
import '/components/marketplace-item-card.js';

class MarketplaceItemGrid extends LitElement {
  static properties = {
    source: { type: String },
    emptyMessage: { type: String },
    items: { state: true },
    loading: { state: true },
    error: { state: true },
    query: { state: true }
  };

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }

    .shell {
      height: 100%;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .toolbar {
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      color: var(--brand-muted);
      font-size: 0.9rem;
      flex-shrink: 0;
    }

    .status {
      font-weight: 800;
      color: var(--brand-ink);
    }

    .query {
      color: var(--brand-muted);
      text-align: right;
    }

    .scroll-region {
      flex: 1;
      min-height: 0;
      overflow: auto;
      padding-right: 0.25rem;
    }

    .scroll-region::-webkit-scrollbar {
      width: 8px;
    }

    .scroll-region::-webkit-scrollbar-thumb {
      background: rgba(95, 158, 169, 0.25);
      border-radius: 999px;
    }

    .grid {
      display: grid;
      gap: 1rem;
    }

    .state-box {
      border: 1px dashed var(--brand-line);
      border-radius: 1.25rem;
      padding: 1.25rem;
      background: var(--brand-white);
      color: var(--brand-muted);
      line-height: 1.6;
      box-shadow: var(--shadow-soft);
    }

    .error {
      border-color: #fecaca;
      background: var(--brand-danger-bg);
      color: var(--brand-danger-text);
    }
  `;

  constructor() {
    super();
    this.source = '/api/items';
    this.emptyMessage = 'No items found.';
    this.items = [];
    this.loading = true;
    this.error = '';
    this.query = '';
    this._requestId = 0;
    this._searchHandler = this.handleSearchChange.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('marketplace-search-change', this._searchHandler);
    this.loadItems();
  }

  disconnectedCallback() {
    window.removeEventListener('marketplace-search-change', this._searchHandler);
    super.disconnectedCallback();
  }

  async loadItems() {
    const requestId = ++this._requestId;
    this.loading = true;
    this.error = '';

    try {
      const url = new URL(this.source, window.location.origin);

      if (this.query) {
        url.searchParams.set('search', this.query);
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to load marketplace items');
      }

      const data = await response.json();

      if (requestId !== this._requestId) return;

      this.items = Array.isArray(data) ? data : [];
    } catch (error) {
      if (requestId !== this._requestId) return;
      this.error = error.message || 'Something went wrong while loading items.';
      this.items = [];
    } finally {
      if (requestId === this._requestId) {
        this.loading = false;
      }
    }
  }

  handleSearchChange(event) {
    this.query = event.detail?.query || '';
    this.loadItems();
  }

  renderStateBox(message, extraClass = '') {
    return html`<div class="state-box ${extraClass}">${message}</div>`;
  }

  renderContent() {
    if (this.loading) {
      return this.renderStateBox('Fetching active listings from the backend...');
    }

    if (this.error) {
      return this.renderStateBox(this.error, 'error');
    }

    if (!this.items.length) {
      return this.renderStateBox(this.emptyMessage);
    }

    return html`
      <div class="grid">
        ${this.items.map(
          (item) => html`<marketplace-item-card .item=${item}></marketplace-item-card>`
        )}
      </div>
    `;
  }

  render() {
    return html`
      <div class="shell">
        <div class="toolbar">
          <span class="status">
            ${this.loading
              ? 'Loading items…'
              : this.error
              ? 'Could not load items'
              : `${this.items.length} item(s) found`}
          </span>

          <span class="query">
            ${this.query
              ? `Search: "${this.query}"`
              : this.loading
              ? 'Preparing marketplace listings'
              : 'Showing all active listings'}
          </span>
        </div>

        <div class="scroll-region">
          ${this.renderContent()}
        </div>
      </div>
    `;
  }
}

customElements.define('marketplace-item-grid', MarketplaceItemGrid);