import { LitElement, html, css } from 'lit';
import { apiPost } from '/js/api-client.js';

class MarketplaceOfferPanel extends LitElement {
  static properties = {
    itemId: { type: String },
    viewerId: { type: String },
    viewerName: { type: String },
    mode: { state: true },
    content: { state: true },
    price: { state: true },
    submitting: { state: true },
    feedback: { state: true },
    feedbackType: { state: true }
  };

  static styles = css`
    :host {
      display: block;
    }

    .panel {
      border-radius: var(--radius-2xl, 1.5rem);
      border: 1px solid var(--brand-line, #d7e1ea);
      background: var(--brand-white, #ffffff);
      padding: 1.25rem;
      box-shadow: var(--shadow-soft, 0 12px 30px rgba(16, 33, 58, 0.08));
    }

    .title {
      font-size: 1.05rem;
      font-weight: 900;
      color: var(--brand-ink, #10213a);
    }

    .hint {
      margin-top: 0.45rem;
      color: var(--brand-muted, #5f7086);
      font-size: 0.9rem;
      line-height: 1.65;
    }

    .switches {
      margin-top: 1rem;
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    button.mode {
      border: 1px solid var(--brand-line, #d7e1ea);
      border-radius: 999px;
      background: var(--brand-white, white);
      color: var(--brand-ink, #334155);
      padding: 0.62rem 0.98rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.18s ease;
    }

    button.mode.active {
      background: var(--brand-navy, #0f2744);
      color: var(--brand-white, white);
      border-color: var(--brand-navy, #0f2744);
    }

    textarea,
    input {
      width: 100%;
      margin-top: 1rem;
      border: 1px solid var(--brand-line, #d7e1ea);
      border-radius: 1rem;
      padding: 0.95rem 1rem;
      font: inherit;
      box-sizing: border-box;
      color: var(--brand-ink, #10213a);
      background: linear-gradient(180deg, #ffffff, #fbfdff);
    }

    textarea {
      min-height: 130px;
      resize: vertical;
      line-height: 1.65;
    }

    textarea:focus,
    input:focus {
      outline: none;
      border-color: var(--brand-teal, #5f9ea9);
      box-shadow: 0 0 0 4px rgba(95, 158, 169, 0.14);
    }

    .actions {
      margin-top: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .submit {
      border: none;
      border-radius: 999px;
      background: linear-gradient(
        135deg,
        var(--brand-navy, #0f2744),
        var(--brand-navy-deep, #09182d)
      );
      color: white;
      padding: 0.85rem 1.15rem;
      font-weight: 800;
      cursor: pointer;
      transition: transform 0.15s ease, opacity 0.15s ease;
    }

    .submit:hover {
      transform: translateY(-1px);
    }

    .submit:disabled {
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

    .error {
      background: var(--brand-danger-bg, #fff1f2);
      color: var(--brand-danger-text, #9f1239);
    }
  `;

  constructor() {
    super();
    this.itemId = '';
    this.viewerId = '';
    this.viewerName = '';
    this.mode = 'text';
    this.content = '';
    this.price = '';
    this.submitting = false;
    this.feedback = '';
    this.feedbackType = 'success';
  }

  setMode(mode) {
    this.mode = mode;
    this.feedback = '';
  }

  async handleSubmit(event) {
    event.preventDefault();

    if (!this.viewerId || !this.viewerName) {
      this.feedback = 'Viewer identity is required for testing.';
      this.feedbackType = 'error';
      return;
    }

    if (!this.content.trim()) {
      this.feedback = 'Please enter a message.';
      this.feedbackType = 'error';
      return;
    }

    if (this.mode === 'offer' && (!this.price || Number(this.price) <= 0)) {
      this.feedback = 'Please enter a valid offer price.';
      this.feedbackType = 'error';
      return;
    }

    this.submitting = true;
    this.feedback = '';

    try {
      const payload = {
        itemId: this.itemId,
        senderId: this.viewerId,
        senderName: this.viewerName,
        content: this.content.trim(),
        type: this.mode
      };

      if (this.mode === 'offer') {
        payload.price = Number(this.price);
      }

      await apiPost('/api/messages', payload);

      this.content = '';
      this.price = '';
      this.feedback =
        this.mode === 'offer' ? 'Offer sent successfully.' : 'Message sent successfully.';
      this.feedbackType = 'success';

      window.dispatchEvent(
        new CustomEvent('marketplace-thread-refresh', {
          detail: { itemId: this.itemId }
        })
      );

      window.dispatchEvent(
        new CustomEvent('marketplace-item-refresh', {
          detail: { itemId: this.itemId }
        })
      );
    } catch (error) {
      this.feedback = error.message || 'Failed to send message.';
      this.feedbackType = 'error';
    } finally {
      this.submitting = false;
    }
  }

  render() {
    return html`
      <section class="panel">
        <div class="title">Send message or offer</div>
        <div class="hint">
          Testing as <strong>${this.viewerName}</strong> (${this.viewerId})
        </div>

        <div class="switches">
          <button
            class="mode ${this.mode === 'text' ? 'active' : ''}"
            @click=${() => this.setMode('text')}
            type="button"
          >
            Text message
          </button>

          <button
            class="mode ${this.mode === 'offer' ? 'active' : ''}"
            @click=${() => this.setMode('offer')}
            type="button"
          >
            Price offer
          </button>
        </div>

        <form @submit=${this.handleSubmit}>
          <textarea
            .value=${this.content}
            @input=${(event) => (this.content = event.target.value)}
            placeholder=${this.mode === 'offer'
              ? 'Write a short note with your offer...'
              : 'Write your message here...'}
          ></textarea>

          ${this.mode === 'offer'
            ? html`
                <input
                  type="number"
                  min="1"
                  .value=${this.price}
                  @input=${(event) => (this.price = event.target.value)}
                  placeholder="Enter your offer amount"
                />
              `
            : ''}

          <div class="actions">
            <button class="submit" ?disabled=${this.submitting} type="submit">
              ${this.submitting
                ? 'Sending...'
                : this.mode === 'offer'
                ? 'Send offer'
                : 'Send message'}
            </button>
          </div>
        </form>

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

customElements.define('marketplace-offer-panel', MarketplaceOfferPanel);