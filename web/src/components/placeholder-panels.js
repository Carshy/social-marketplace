import { LitElement, html, css } from 'lit';

const registerPlaceholder = (tagName, title, description) => {
  if (customElements.get(tagName)) return;

  class PlaceholderPanel extends LitElement {
    static properties = {
      itemId: { type: String },
      sellerId: { type: String }
    };

    static styles = css`
      :host {
        display: block;
      }

      .panel {
        border-radius: 1.25rem;
        border: 1px dashed #cbd5e1;
        background: #f8fafc;
        padding: 1.25rem;
      }

      .eyebrow {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #64748b;
      }

      h4 {
        margin: 0.65rem 0 0;
        font-size: 1rem;
        font-weight: 700;
        color: #0f172a;
      }

      p {
        margin: 0.75rem 0 0;
        color: #475569;
        line-height: 1.65;
      }

      .meta {
        margin-top: 1rem;
        font-size: 0.85rem;
        color: #64748b;
      }
    `;

    render() {
      return html`
        <section class="panel">
          <div class="eyebrow">Next build step</div>
          <h4>${title}</h4>
          <p>${description}</p>
          <div class="meta">
            ${this.itemId ? html`Item ID: ${this.itemId}` : ''}
            ${this.sellerId ? html`Seller ID: ${this.sellerId}` : ''}
          </div>
        </section>
      `;
    }
  }

  customElements.define(tagName, PlaceholderPanel);
};

registerPlaceholder(
  'marketplace-item-detail',
  'Item detail component pending',
  'This panel will soon render the real listing details from the backend.'
);

registerPlaceholder(
  'marketplace-offer-panel',
  'Offer panel pending',
  'This panel will soon let buyers submit offers and sellers respond.'
);

registerPlaceholder(
  'marketplace-chat-thread',
  'Chat thread pending',
  'This panel will soon load full item threads and poll for updates.'
);

registerPlaceholder(
  'marketplace-checkout-panel',
  'Checkout panel pending',
  'This panel will soon handle buyer checkout and seller confirmation state.'
);

registerPlaceholder(
  'marketplace-seller-summary',
  'Seller summary pending',
  'This panel will soon summarize seller inventory and sale status.'
);

registerPlaceholder(
  'marketplace-seller-items',
  'Seller items pending',
  'This panel will soon list the seller’s active and sold items.'
);