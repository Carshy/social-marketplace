import { LitElement, html, css } from 'lit';

class MarketplaceItemCard extends LitElement {
  static properties = {
    item: { type: Object }
  };

  static styles = css`
    :host {
      display: block;
    }

    a {
      display: block;
      text-decoration: none;
      color: inherit;
    }

    .card {
      overflow: hidden;
      border: 1px solid var(--brand-line);
      border-radius: 1.25rem;
      background: var(--brand-white);
      transition: transform 0.18s ease, box-shadow 0.18s ease;
      box-shadow: var(--shadow-soft);
    }

    .card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-card);
    }

    img {
      width: 100%;
      height: 220px;
      object-fit: cover;
      display: block;
      background: #f1f5f9;
    }

    .content {
      padding: 1rem;
    }

    .seller {
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--brand-teal);
    }

    h4 {
      margin: 0.55rem 0 0;
      font-size: 1rem;
      line-height: 1.5;
      font-weight: 800;
      color: var(--brand-ink);
    }

    p {
      margin: 0.6rem 0 0;
      font-size: 0.92rem;
      line-height: 1.65;
      color: var(--brand-muted);
    }

    .footer {
      margin-top: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .price {
      font-size: 1.1rem;
      font-weight: 900;
      color: var(--brand-ink);
    }

    .badge {
      border-radius: 999px;
      background: var(--brand-soft-2);
      color: var(--brand-teal);
      padding: 0.45rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 800;
    }
  `;

  constructor() {
    super();
    this.item = {};
  }

  getFallbackImage(item) {
    const label = encodeURIComponent(item?.name || 'Collectible Item');
    return `https://via.placeholder.com/600x400?text=${label}`;
  }

  handleImageError(event) {
    const fallback = this.getFallbackImage(this.item);
    if (event.target.src !== fallback) {
      event.target.src = fallback;
    }
  }

  render() {
    const item = this.item || {};
    const image = item.image || this.getFallbackImage(item);

    return html`
      <a href="/items/${item.id}">
        <article class="card">
          <img
            src=${image}
            alt=${item.name || 'Marketplace item'}
            @error=${this.handleImageError}
          />
          <div class="content">
            <div class="seller">${item.sellerName || 'Unknown seller'}</div>
            <h4>${item.name || 'Untitled item'}</h4>
            <p>${item.description || 'No description provided.'}</p>

            <div class="footer">
              <span class="price">$${Number(item.price || 0).toLocaleString()}</span>
              <span class="badge">View details</span>
            </div>
          </div>
        </article>
      </a>
    `;
  }
}

customElements.define('marketplace-item-card', MarketplaceItemCard);