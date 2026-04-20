import { LitElement, html, css } from 'lit';
import { apiGet } from '/js/api-client.js';

class MarketplaceSellerSummary extends LitElement {
  static properties = {
    sellerId: { type: String },
    items: { state: true },
    loading: { state: true },
    error: { state: true }
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

    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.85rem;
    }

    .card {
      border-radius: 1rem;
      background: #f8fafc;
      padding: 0.95rem 1rem;
    }

    .label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #64748b;
      font-weight: 700;
    }

    .value {
      margin-top: 0.35rem;
      font-size: 1.25rem;
      font-weight: 800;
      color: #0f172a;
    }
  `;

  constructor() {
    super();
    this.sellerId = '';
    this.items = [];
    this.loading = false;
    this.error = '';
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
      console.log('Loading seller summary for sellerId:', this.sellerId);
      this.items = await apiGet(`/api/items/seller/${this.sellerId}`);
    } catch (error) {
      this.items = [];
      this.error = error.message || 'Failed to load seller summary';
    } finally {
      this.loading = false;
    }
  }

  getStats() {
    const total = this.items.length;
    const active = this.items.filter((item) => item.status === 'active').length;
    const sold = this.items.filter((item) => item.status === 'sold').length;
    const awaitingPayment = this.items.filter(
      (item) => item.paymentStatus === 'awaiting_checkout'
    ).length;
    const paidWaitingConfirm = this.items.filter(
      (item) => item.status === 'active' && item.paymentStatus === 'paid'
    ).length;

    return { total, active, sold, awaitingPayment, paidWaitingConfirm };
  }

  render() {
    if (!this.sellerId) {
      return html`<div class="state-box">Waiting for seller identity…</div>`;
    }

    if (this.loading) {
      return html`<div class="state-box">Loading seller summary…</div>`;
    }

    if (this.error) {
      return html`<div class="state-box error">${this.error}</div>`;
    }

    const stats = this.getStats();

    return html`
      <section class="panel">
        <div class="title">Seller summary</div>

        <div class="grid">
          <div class="card">
            <div class="label">Total items</div>
            <div class="value">${stats.total}</div>
          </div>

          <div class="card">
            <div class="label">Active</div>
            <div class="value">${stats.active}</div>
          </div>

          <div class="card">
            <div class="label">Awaiting checkout</div>
            <div class="value">${stats.awaitingPayment}</div>
          </div>

          <div class="card">
            <div class="label">Paid awaiting confirm</div>
            <div class="value">${stats.paidWaitingConfirm}</div>
          </div>

          <div class="card">
            <div class="label">Sold</div>
            <div class="value">${stats.sold}</div>
          </div>
        </div>
      </section>
    `;
  }
}

customElements.define('marketplace-seller-summary', MarketplaceSellerSummary);