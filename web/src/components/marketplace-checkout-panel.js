import { LitElement, html, css } from 'lit';
import { apiGet, apiPost } from '/js/api-client.js';

class MarketplaceCheckoutPanel extends LitElement {
  static properties = {
    itemId: { type: String },
    viewerId: { type: String },
    viewerName: { type: String },
    item: { state: true },
    loading: { state: true },
    error: { state: true },
    busy: { state: true },
    feedback: { state: true },
    feedbackType: { state: true }
  };

  static styles = css`
    :host {
      display: block;
    }

    .panel,
    .state-box {
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

    .title {
      font-size: 1.05rem;
      font-weight: 900;
      color: var(--brand-ink, #10213a);
    }

    .status-list {
      margin-top: 1rem;
      display: grid;
      gap: 0.8rem;
    }

    .status-card {
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
      font-size: 1rem;
      font-weight: 900;
      color: var(--brand-ink, #10213a);
    }

    .actions {
      margin-top: 1rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    button {
      border: none;
      border-radius: 999px;
      background: linear-gradient(
        135deg,
        var(--brand-navy, #0f2744),
        var(--brand-navy-deep, #09182d)
      );
      color: #ffffff;
      padding: 0.85rem 1.08rem;
      font-weight: 800;
      cursor: pointer;
      transition: transform 0.15s ease, opacity 0.15s ease;
    }

    button:hover {
      transform: translateY(-1px);
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .feedback {
      margin-top: 1rem;
      border-radius: 1rem;
      padding: 0.82rem 1rem;
      font-size: 0.9rem;
      font-weight: 700;
    }

    .success {
      background: var(--brand-success-bg, #ecfdf5);
      color: var(--brand-success-text, #065f46);
    }

    .danger {
      background: var(--brand-danger-bg, #fff1f2);
      color: var(--brand-danger-text, #9f1239);
    }

    .hint {
      margin-top: 0.9rem;
      color: var(--brand-muted, #64748b);
      font-size: 0.9rem;
      line-height: 1.65;
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
    this.busy = false;
    this.feedback = '';
    this.feedbackType = 'success';
    this._refreshHandler = this.handleRefresh.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('marketplace-item-refresh', this._refreshHandler);
    window.addEventListener('marketplace-thread-refresh', this._refreshHandler);
    this.loadItem();
  }

  disconnectedCallback() {
    window.removeEventListener('marketplace-item-refresh', this._refreshHandler);
    window.removeEventListener('marketplace-thread-refresh', this._refreshHandler);
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
      this.error = error.message || 'Failed to load item payment state';
      this.item = null;
    } finally {
      this.loading = false;
    }
  }

  async handleCheckout() {
    this.busy = true;
    this.feedback = '';

    try {
      await apiPost(`/api/items/${this.itemId}/checkout`, {
        buyerId: this.viewerId
      });

      this.feedback = 'Checkout recorded successfully.';
      this.feedbackType = 'success';
      await this.loadItem();

      window.dispatchEvent(
        new CustomEvent('marketplace-item-refresh', {
          detail: { itemId: this.itemId }
        })
      );
    } catch (error) {
      this.feedback = error.message || 'Checkout failed.';
      this.feedbackType = 'danger';
    } finally {
      this.busy = false;
    }
  }

  async handleConfirmSale() {
    this.busy = true;
    this.feedback = '';

    try {
      await apiPost(`/api/items/${this.itemId}/confirm-sale`, {
        sellerId: this.viewerId
      });

      this.feedback = 'Sale confirmed successfully.';
      this.feedbackType = 'success';
      await this.loadItem();

      window.dispatchEvent(
        new CustomEvent('marketplace-item-refresh', {
          detail: { itemId: this.itemId }
        })
      );
    } catch (error) {
      this.feedback = error.message || 'Seller confirmation failed.';
      this.feedbackType = 'danger';
    } finally {
      this.busy = false;
    }
  }

  render() {
    if (this.loading) {
      return html`<div class="state-box">Loading checkout state…</div>`;
    }

    if (this.error) {
      return html`<div class="state-box error">${this.error}</div>`;
    }

    if (!this.item) {
      return html`<div class="state-box">Item state unavailable.</div>`;
    }

    const isSeller = this.item.sellerId === this.viewerId;
    const isAgreedBuyer = this.item.agreedBuyerId === this.viewerId;
    const canCheckout =
      isAgreedBuyer &&
      this.item.status === 'active' &&
      this.item.paymentStatus !== 'paid';

    const canConfirmSale =
      isSeller &&
      this.item.status === 'active' &&
      this.item.paymentStatus === 'paid';

    return html`
      <section class="panel">
        <div class="title">Checkout and sale confirmation</div>

        <div class="status-list">
          <div class="status-card">
            <div class="label">Agreed buyer</div>
            <div class="value">${this.item.agreedBuyerId || 'Not set yet'}</div>
          </div>

          <div class="status-card">
            <div class="label">Agreed price</div>
            <div class="value">
              ${this.item.agreedPrice
                ? `$${Number(this.item.agreedPrice).toLocaleString()}`
                : 'Not set yet'}
            </div>
          </div>

          <div class="status-card">
            <div class="label">Payment status</div>
            <div class="value">${this.item.paymentStatus || 'unpaid'}</div>
          </div>

          <div class="status-card">
            <div class="label">Item status</div>
            <div class="value">${this.item.status || 'active'}</div>
          </div>
        </div>

        <div class="actions">
          ${canCheckout
            ? html`
                <button ?disabled=${this.busy} @click=${() => this.handleCheckout()}>
                  ${this.busy ? 'Processing...' : 'Confirm checkout as buyer'}
                </button>
              `
            : ''}

          ${canConfirmSale
            ? html`
                <button ?disabled=${this.busy} @click=${() => this.handleConfirmSale()}>
                  ${this.busy ? 'Processing...' : 'Confirm sale as seller'}
                </button>
              `
            : ''}
        </div>

        <div class="hint">
          Checkout appears for the agreed buyer after an offer is accepted.
          Seller confirmation appears after payment is marked paid.
        </div>

        ${this.feedback
          ? html`
              <div class="feedback ${this.feedbackType}">
                ${this.feedback}
              </div>
            `
          : ''}
      </section>
    `;
  }
}

customElements.define('marketplace-checkout-panel', MarketplaceCheckoutPanel);