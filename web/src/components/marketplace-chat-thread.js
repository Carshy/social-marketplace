import { showToast } from '/js/ui-events.js';
import { LitElement, html, css } from 'lit';
import { apiGet, apiPost } from '/js/api-client.js';

class MarketplaceChatThread extends LitElement {
  static properties = {
    itemId: { type: String },
    viewerId: { type: String },
    viewerName: { type: String },
    item: { state: true },
    messages: { state: true },
    loading: { state: true },
    error: { state: true },
    lastTimestamp: { state: true },
    actionBusyId: { state: true }
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

    .thread {
      display: flex;
      flex-direction: column;
      gap: 0.95rem;
      max-height: 560px;
      overflow: auto;
      padding-right: 0.25rem;
    }

    .thread::-webkit-scrollbar {
      width: 8px;
    }

    .thread::-webkit-scrollbar-thumb {
      background: rgba(95, 158, 169, 0.25);
      border-radius: 999px;
    }

    .bubble {
      max-width: 88%;
      border-radius: 1.05rem;
      padding: 0.95rem 1rem;
      box-shadow: 0 8px 20px rgba(16, 33, 58, 0.05);
    }

    .mine {
      align-self: flex-end;
      background: linear-gradient(
        135deg,
        var(--brand-navy, #0f2744),
        var(--brand-navy-deep, #09182d)
      );
      color: #ffffff;
    }

    .other {
      align-self: flex-start;
      background: linear-gradient(180deg, #ffffff, #f8fbfd);
      color: var(--brand-ink, #0f172a);
      border: 1px solid rgba(215, 225, 234, 0.9);
    }

    .system {
      align-self: center;
      background: var(--brand-info-bg, #eff6ff);
      color: var(--brand-info-text, #1d4ed8);
      max-width: 100%;
      text-align: center;
      border: 1px solid rgba(147, 197, 253, 0.65);
    }

    .offer {
      border: 1px solid rgba(95, 158, 169, 0.35);
      background: linear-gradient(180deg, #f9fdff, #eff8fb);
    }

    .meta {
      margin-bottom: 0.45rem;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.04em;
      color: inherit;
      opacity: 0.85;
    }

    .status-chip {
      display: inline-block;
      margin-top: 0.7rem;
      border-radius: 999px;
      padding: 0.38rem 0.7rem;
      font-size: 0.72rem;
      font-weight: 800;
      background: rgba(16, 33, 58, 0.08);
      color: inherit;
    }

    .status-chip.pending {
      background: #fff7e8;
      color: #b45309;
    }

    .status-chip.accepted {
      background: var(--brand-success-bg, #eaf9f0);
      color: var(--brand-success-text, #166534);
    }

    .status-chip.rejected {
      background: var(--brand-danger-bg, #fff1f2);
      color: var(--brand-danger-text, #9f1239);
    }

    .status-chip.countered {
      background: var(--brand-info-bg, #eef6ff);
      color: var(--brand-info-text, #1d4ed8);
    }

    .headline {
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .title {
      font-size: 1.05rem;
      font-weight: 900;
      color: var(--brand-ink, #10213a);
    }

    .hint {
      font-size: 0.8rem;
      color: var(--brand-muted, #64748b);
      font-weight: 700;
    }

    .actions {
      margin-top: 0.9rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.55rem;
    }

    button {
      border: none;
      border-radius: 999px;
      padding: 0.58rem 0.82rem;
      font-size: 0.78rem;
      font-weight: 800;
      cursor: pointer;
      transition: transform 0.15s ease, opacity 0.15s ease;
    }

    button:hover {
      transform: translateY(-1px);
    }

    .accept {
      background: var(--brand-success-bg, #dcfce7);
      color: var(--brand-success-text, #166534);
    }

    .reject {
      background: var(--brand-danger-bg, #fee2e2);
      color: var(--brand-danger-text, #991b1b);
    }

    .counter {
      background: var(--brand-info-bg, #e0e7ff);
      color: #3730a3;
    }

    button:disabled {
      opacity: 0.65;
      cursor: not-allowed;
      transform: none;
    }
  `;

  constructor() {
    super();
    this.itemId = '';
    this.viewerId = '';
    this.viewerName = '';
    this.item = null;
    this.messages = [];
    this.loading = true;
    this.error = '';
    this.lastTimestamp = '';
    this.actionBusyId = '';
    this._pollTimer = null;
    this._refreshHandler = this.handleRefresh.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('marketplace-thread-refresh', this._refreshHandler);
    this.loadContext();
  }

  disconnectedCallback() {
    window.removeEventListener('marketplace-thread-refresh', this._refreshHandler);
    if (this._pollTimer) clearTimeout(this._pollTimer);
    super.disconnectedCallback();
  }

  handleRefresh(event) {
    if (!event.detail || event.detail.itemId !== this.itemId) return;
    this.loadContext();
  }

  async loadItem() {
    this.item = await apiGet(`/api/items/${this.itemId}`);
  }

  async loadThreadOnly() {
    const data = await apiGet(`/api/messages/item/${this.itemId}`);
    this.messages = Array.isArray(data.messages) ? data.messages : [];
    this.lastTimestamp =
      this.messages.length > 0
        ? this.messages[this.messages.length - 1].timestamp
        : new Date().toISOString();

    if (this.viewerId) {
      try {
        await apiPost('/api/messages/read', {
          userId: this.viewerId,
          itemId: this.itemId
        });
      } catch (_error) {}
    }
  }

  async loadContext() {
    this.loading = true;
    this.error = '';

    try {
      await Promise.all([this.loadItem(), this.loadThreadOnly()]);
      this.startPolling();
    } catch (error) {
      this.error = error.message || 'Failed to load conversation';
      this.messages = [];
      this.item = null;
    } finally {
      this.loading = false;
    }
  }

  startPolling() {
    if (this._pollTimer) clearTimeout(this._pollTimer);

    const poll = async () => {
      try {
        const data = await apiGet(
          `/api/messages/item/${this.itemId}/poll/${encodeURIComponent(this.lastTimestamp)}`
        );

        const incoming = Array.isArray(data.messages) ? data.messages : [];

        if (incoming.length > 0) {
          this.messages = [...this.messages, ...incoming];
          this.lastTimestamp = data.lastTimestamp || this.lastTimestamp;

          window.dispatchEvent(
            new CustomEvent('marketplace-item-refresh', {
              detail: { itemId: this.itemId }
            })
          );
        }

        this._pollTimer = setTimeout(poll, data.pollAgainAfter || 2000);
      } catch (_error) {
        this._pollTimer = setTimeout(poll, 3000);
      }
    };

    this._pollTimer = setTimeout(poll, 2000);
  }

  getBubbleClass(message) {
    if (message.senderId === 'system') return 'bubble system';
    if (message.senderId === this.viewerId) return 'bubble mine';
    if (message.type === 'offer') return 'bubble other offer';
    return 'bubble other';
  }

  get isSellerViewer() {
    return this.item && this.item.sellerId === this.viewerId;
  }

  canActOnOffer(message) {
    return (
      this.isSellerViewer &&
      message.type === 'offer' &&
      message.senderId !== this.viewerId &&
      message.status === 'pending'
    );
  }

  async handleOfferAction(messageId, action) {
    this.actionBusyId = messageId;

    try {
      await apiPost(`/api/messages/${messageId}/${action}`, {});
      await this.loadContext();

      window.dispatchEvent(
        new CustomEvent('marketplace-item-refresh', {
          detail: { itemId: this.itemId }
        })
      );
      window.dispatchEvent(
        new CustomEvent('marketplace-seller-dashboard-refresh', {
          detail: { sellerId: this.viewerId }
        })
      );
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Offer action failed',
        message: error.message || `Failed to ${action} offer.`
      });
    } finally {
      this.actionBusyId = '';
    }
  }

  async handleCounterOffer(message) {
    const rawPrice = window.prompt('Enter counter offer amount');
    if (!rawPrice) return;

    const counterPrice = Number(rawPrice); 

    if (!Number.isFinite(counterPrice) || counterPrice <= 0) {
      showToast({
        type: 'error',
        title: 'Invalid counter amount',
        message: 'Please enter a valid positive counter amount.'
      });
      return;
    }

    const content =
      window.prompt('Optional note for the counter offer', `I can do ${counterPrice}`) ||
      `I can do ${counterPrice}`;

    this.actionBusyId = message.id;

    try {
      await apiPost(`/api/messages/${message.id}/counter`, {
        senderId: this.viewerId,
        senderName: this.viewerName,
        counterPrice,
        content
      });

      await this.loadContext();

      window.dispatchEvent(
        new CustomEvent('marketplace-item-refresh', {
          detail: { itemId: this.itemId }
        })
      );
      window.dispatchEvent(
        new CustomEvent('marketplace-seller-dashboard-refresh', {
          detail: { sellerId: this.viewerId }
        })
      );
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Counter offer failed',
        message: error.message || 'Failed to create counter offer.'
      });
    } finally {
      this.actionBusyId = '';
    }
  }

  statusChipClass(message) {
    const status = message.status || '';
    return `status-chip ${status}`;
  }

  renderOfferActions(message) {
    if (!this.canActOnOffer(message)) return null;

    const busy = this.actionBusyId === message.id;

    return html`
      <div class="actions">
        <button
          class="accept"
          ?disabled=${busy}
          @click=${() => this.handleOfferAction(message.id, 'accept')}
        >
          ${busy ? 'Working...' : 'Accept'}
        </button>

        <button
          class="reject"
          ?disabled=${busy}
          @click=${() => this.handleOfferAction(message.id, 'reject')}
        >
          ${busy ? 'Working...' : 'Reject'}
        </button>

        <button
          class="counter"
          ?disabled=${busy}
          @click=${() => this.handleCounterOffer(message)}
        >
          ${busy ? 'Working...' : 'Counter'}
        </button>
      </div>
    `;
  }

  renderMessage(message) {
    const isOffer = message.type === 'offer';

    return html`
      <div class=${this.getBubbleClass(message)}>
        <div class="meta">
          ${message.senderName} · ${new Date(message.timestamp).toLocaleString()}
        </div>

        <div>${message.content}</div>

        ${isOffer
          ? html`
              <div class=${this.statusChipClass(message)}>
                Offer: $${Number(message.price || 0).toLocaleString()}
                ${message.status ? ` · ${message.status}` : ''}
              </div>
              ${this.renderOfferActions(message)}
            `
          : ''}
      </div>
    `;
  }

  render() {
    if (this.loading) {
      return html`<div class="state-box">Loading conversation…</div>`;
    }

    if (this.error) {
      return html`<div class="state-box error">${this.error}</div>`;
    }

    return html`
      <section class="panel">
        <div class="headline">
          <div class="title">Conversation</div>
          <div class="hint">
            ${this.isSellerViewer ? 'Seller controls enabled' : 'Polling for updates'}
          </div>
        </div>

        <div class="thread">
          ${this.messages.length
            ? this.messages.map((message) => this.renderMessage(message))
            : html`<div class="state-box">No messages yet for this item.</div>`}
        </div>
      </section>
    `;
  }
}

customElements.define('marketplace-chat-thread', MarketplaceChatThread);