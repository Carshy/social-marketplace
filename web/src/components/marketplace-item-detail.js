import { LitElement, html, css } from 'lit';
import { apiGet } from '/js/api-client.js';

class MarketplaceItemDetail extends LitElement {
  static properties = {
    itemId: { type: String },
    viewerId: { type: String },
    viewerName: { type: String },
    item: { state: true },
    loading: { state: true },
    error: { state: true }
  };

  static styles = css`
    :host {
      display: block;
    }

    .state-box,
    .panel {
      border-radius: var(--radius-2xl, 1.5rem);
      border: 1px solid var(--brand-line, #d7e1ea);
      background: var(--brand-white, #ffffff);
      padding: 1.25rem;
      box-shadow: var(--shadow-soft, 0 12px 30px rgba(16, 33, 58, 0.08));
    }

    .error {
      border-color: #fecaca;
      background: var(--brand-danger-bg, #fff1f2);
      color: var(--brand-danger-text, #9f1239);
    }

    .image-wrap {
      position: relative;
      overflow: hidden;
      border-radius: 1.25rem;
      background: linear-gradient(180deg, var(--brand-soft, #f4f8fb), #eaf1f6);
      box-shadow: inset 0 0 0 1px rgba(215, 225, 234, 0.6);
    }

    .image {
      width: 100%;
      height: 340px;
      object-fit: cover;
      display: block;
      background: #f1f5f9;
    }

    .meta {
      margin-top: 1rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
    }

    .chip {
      border-radius: 999px;
      background: var(--brand-soft-2, #eef4f8);
      color: var(--brand-ink, #10213a);
      padding: 0.46rem 0.75rem;
      font-size: 0.74rem;
      font-weight: 800;
      border: 1px solid rgba(215, 225, 234, 0.75);
    }

    .chip.status-active {
      background: var(--brand-info-bg, #eef6ff);
      color: var(--brand-info-text, #1d4ed8);
    }

    .chip.status-sold {
      background: var(--brand-success-bg, #eaf9f0);
      color: var(--brand-success-text, #166534);
    }

    .chip.viewer {
      background: rgba(95, 158, 169, 0.12);
      color: var(--brand-teal, #5f9ea9);
    }

    h4 {
      margin: 1rem 0 0;
      font-size: 1.35rem;
      font-weight: 900;
      line-height: 1.25;
      color: var(--brand-ink, #10213a);
    }

    p {
      margin: 0.85rem 0 0;
      line-height: 1.75;
      color: var(--brand-muted, #5f7086);
      font-size: 0.95rem;
    }

    .price-row {
      margin-top: 1.2rem;
      display: grid;
      gap: 0.85rem;
    }

    .price-card {
      border-radius: 1rem;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 248, 251, 0.96));
      padding: 0.95rem 1rem;
      border: 1px solid rgba(215, 225, 234, 0.85);
    }

    .label {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: var(--brand-teal, #5f9ea9);
      font-weight: 800;
    }

    .value {
      margin-top: 0.38rem;
      font-size: 1.18rem;
      font-weight: 900;
      color: var(--brand-ink, #10213a);
    }

    .viewer {
      margin-top: 1rem;
      font-size: 0.85rem;
      color: var(--brand-muted, #5f7086);
      line-height: 1.6;
      padding-top: 0.9rem;
      border-top: 1px dashed rgba(215, 225, 234, 0.95);
    }
  `;

  constructor() {
    super();
    this.itemId = '';
    this.viewerId = '';
    this.viewerName = '';
    this.item = null;
    this.loading = true;
    this.error = '';
    this._refreshHandler = this.handleRefresh.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('marketplace-item-refresh', this._refreshHandler);
    this.loadItem();
  }

  disconnectedCallback() {
    window.removeEventListener('marketplace-item-refresh', this._refreshHandler);
    super.disconnectedCallback();
  }

  handleRefresh(event) {
    if (!event.detail || event.detail.itemId !== this.itemId) return;
    this.loadItem();
  }

  async loadItem() {
    this.loading = true;
    this.error = '';

    try {
      this.item = await apiGet(`/api/items/${this.itemId}`);
    } catch (error) {
      this.error = error.message || 'Failed to load item';
      this.item = null;
    } finally {
      this.loading = false;
    }
  }

  statusChipClass(status) {
    return status === 'sold' ? 'chip status-sold' : 'chip status-active';
  }

  render() {
    if (this.loading) {
      return html`<div class="state-box">Loading item details…</div>`;
    }

    if (this.error) {
      return html`<div class="state-box error">${this.error}</div>`;
    }

    if (!this.item) {
      return html`<div class="state-box">Item not found.</div>`;
    }

    const image =
      this.item.image || 'https://via.placeholder.com/600x400?text=Collectible+Item';

    return html`
      <article class="panel">
        <div class="image-wrap">
          <img class="image" src=${image} alt=${this.item.name || 'Marketplace item'} />
        </div>

        <div class="meta">
          <span class="chip">Seller: ${this.item.sellerName}</span>
          <span class=${this.statusChipClass(this.item.status)}>Status: ${this.item.status}</span>
          <span class="chip viewer">Viewer: ${this.viewerName}</span>
        </div>

        <h4>${this.item.name}</h4>
        <p>${this.item.description}</p>

        <div class="price-row">
          <div class="price-card">
            <div class="label">Listed price</div>
            <div class="value">$${Number(this.item.price || 0).toLocaleString()}</div>
          </div>

          <div class="price-card">
            <div class="label">Highest offer</div>
            <div class="value">
              ${this.item.highestOffer
                ? `$${Number(this.item.highestOffer).toLocaleString()}`
                : 'No offer yet'}
            </div>
          </div>

          <div class="price-card">
            <div class="label">Payment status</div>
            <div class="value">${this.item.paymentStatus || 'unpaid'}</div>
          </div>
        </div>

        <div class="viewer">
          Testing as <strong>${this.viewerName}</strong> (${this.viewerId})
        </div>
      </article>
    `;
  }
}

customElements.define('marketplace-item-detail', MarketplaceItemDetail);