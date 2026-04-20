import { showToast } from '/js/ui-events.js';
import { LitElement, html, css } from 'lit';
import { apiGet, apiPost } from '/js/api-client.js';

class MarketplaceSellerItems extends LitElement {
  static properties = {
    sellerId: { type: String },
    items: { state: true },
    loading: { state: true },
    error: { state: true },
    busyItemId: { state: true }
  };

  static styles = css`
    :host {
      display: block;
    }

    .panel,
    .state-box {
      border-radius: 1.25rem;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      padding: 1.25rem;
    }

    .error {
      border-color: #fecaca;
      background: #fff1f2;
      color: #9f1239;
    }

    .title {
      font-size: 1rem;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 1rem;
    }

    .list {
      display: grid;
      gap: 0.9rem;
    }

    .card {
      border-radius: 1rem;
      background: #f8fafc;
      padding: 1rem;
    }

    .top {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 1rem;
    }

    .name {
      font-size: 1rem;
      font-weight: 800;
      color: #0f172a;
    }

    .desc {
      margin-top: 0.45rem;
      color: #475569;
      line-height: 1.6;
      font-size: 0.92rem;
    }

    .meta {
      margin-top: 0.8rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .chip {
      border-radius: 999px;
      background: #e2e8f0;
      color: #334155;
      padding: 0.38rem 0.65rem;
      font-size: 0.72rem;
      font-weight: 700;
    }

    .actions {
      margin-top: 0.9rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
    }

    a,
    button {
      border: none;
      border-radius: 999px;
      padding: 0.7rem 0.95rem;
      font-size: 0.8rem;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
    }

    a {
      background: #0f172a;
      color: #ffffff;
    }

    button {
      background: #dcfce7;
      color: #166534;
    }

    button:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .price {
      font-size: 1rem;
      font-weight: 800;
      color: #0f172a;
      white-space: nowrap;
    }
  `;

  constructor() {
    super();
    this.sellerId = '';
    this.items = [];
    this.loading = false;
    this.error = '';
    this.busyItemId = '';
    this._refreshHandler = this.handleRefresh.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('marketplace-seller-dashboard-refresh', this._refreshHandler);
  }

  disconnectedCallback() {
    window.removeEventListener('marketplace-seller-dashboard-refresh', this._refreshHandler);
    super.disconnectedCallback();
  }

  updated(changedProps) {
    if (changedProps.has('sellerId') && this.sellerId) {
      this.loadItems();
    }
  }

  handleRefresh(event) {
    if (event.detail?.sellerId && event.detail.sellerId !== this.sellerId) return;
    if (!this.sellerId) return;
    this.loadItems();
  }

  async loadItems() {
    if (!this.sellerId) return;

    this.loading = true;
    this.error = '';

    try {
      console.log('Loading seller items for sellerId:', this.sellerId);
      this.items = await apiGet(`/api/items/seller/${this.sellerId}`);
    } catch (error) {
      this.items = [];
      this.error = error.message || 'Failed to load seller items';
    } finally {
      this.loading = false;
    }
  }

  canConfirm(item) {
    return item.status === 'active' && item.paymentStatus === 'paid';
  }

  async confirmSale(itemId) {
    this.busyItemId = itemId;

    try {
      await apiPost(`/api/items/${itemId}/confirm-sale`, {
        sellerId: this.sellerId
      });

      await this.loadItems();

      showToast({
        type: 'success',
        title: 'Sale confirmed',
        message: 'The item was marked as sold successfully.'
      });

      window.dispatchEvent(
        new CustomEvent('marketplace-seller-dashboard-refresh', {
          detail: { sellerId: this.sellerId }
        })
      );
      window.dispatchEvent(
        new CustomEvent('marketplace-item-refresh', {
          detail: { itemId }
        })
      );
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Sale confirmation failed',
        message: error.message || 'Failed to confirm sale.'
      });
    } finally {
      this.busyItemId = '';
    }
  } 

  render() {
    if (!this.sellerId) {
      return html`<div class="state-box">Waiting for seller identity…</div>`;
    }

    if (this.loading) {
      return html`<div class="state-box">Loading seller items…</div>`;
    }

    if (this.error) {
      return html`<div class="state-box error">${this.error}</div>`;
    }

    if (!this.items.length) {
      return html`<div class="state-box">No items found for this seller.</div>`;
    }

    return html`
      <section class="panel">
        <div class="title">Seller items</div>

        <div class="list">
          ${this.items.map((item) => {
            const busy = this.busyItemId === item.id;
            return html`
              <article class="card">
                <div class="top">
                  <div>
                    <div class="name">${item.name}</div>
                    <div class="desc">${item.description}</div>
                  </div>

                  <div class="price">
                    $${Number(item.agreedPrice || item.price || 0).toLocaleString()}
                  </div>
                </div>

                <div class="meta">
                  <span class="chip">Status: ${item.status}</span>
                  <span class="chip">Payment: ${item.paymentStatus || 'unpaid'}</span>
                  <span class="chip">
                    Highest offer:
                    ${item.highestOffer
                      ? `$${Number(item.highestOffer).toLocaleString()}`
                      : 'none'}
                  </span>
                  <span class="chip">Agreed buyer: ${item.agreedBuyerId || 'none'}</span>
                </div>

                <div class="actions">
                  <a
                    href="/items/${item.id}?viewerId=${this.sellerId}&viewerName=${encodeURIComponent(item.sellerName || 'Seller')}"
                  >
                    Open item view
                  </a>

                  ${this.canConfirm(item)
                    ? html`
                        <button
                          ?disabled=${busy}
                          @click=${() => this.confirmSale(item.id)}
                        >
                          ${busy ? 'Processing...' : 'Confirm sale'}
                        </button>
                      `
                    : ''}
                </div>
              </article>
            `;
          })}
        </div>
      </section>
    `;
  }
}

customElements.define('marketplace-seller-items', MarketplaceSellerItems);