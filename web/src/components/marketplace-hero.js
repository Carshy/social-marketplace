import { LitElement, html, css } from 'lit';

class MarketplaceHero extends LitElement {
  static properties = {
    title: { type: String },
    subtitle: { type: String }
  };

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }

    .hero {
      height: 100%;
      border-radius: var(--radius-2xl, 1.5rem);
      background:
        linear-gradient(135deg, rgba(95, 158, 169, 0.16), transparent 30%),
        linear-gradient(145deg, rgba(242, 193, 78, 0.12), transparent 40%),
        linear-gradient(180deg, var(--brand-navy) 0%, var(--brand-navy-deep) 100%);
      color: var(--brand-white, white);
      padding: 1.5rem;
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1.25rem;
    }

    .eyebrow {
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.76);
    }

    h2 {
      margin: 0.9rem 0 0;
      font-size: 2.15rem;
      line-height: 1.08;
      font-weight: 900;
    }

    p {
      margin: 1rem 0 0;
      max-width: 42rem;
      color: rgba(255, 255, 255, 0.86);
      line-height: 1.75;
      font-size: 0.98rem;
    }

    .meta {
      display: grid;
      gap: 0.75rem;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
    }

    .chip {
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.12);
      padding: 0.58rem 0.92rem;
      font-size: 0.8rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.95);
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.65rem;
    }

    .stat {
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.08);
      padding: 0.85rem;
      backdrop-filter: blur(6px);
    }

    .stat-label {
      font-size: 0.7rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 800;
    }

    .stat-value {
      margin-top: 0.35rem;
      font-size: 1rem;
      font-weight: 900;
      color: #ffffff;
    }
  `;

  constructor() {
    super();
    this.title = '';
    this.subtitle = '';
  }

  render() {
    return html`
      <section class="hero" aria-label="Marketplace introduction">
        <div>
          <div class="eyebrow">Featured marketplace</div>
          <h2>${this.title}</h2>
          <p>${this.subtitle}</p>
        </div>

        <div class="meta">
          <div class="chips">
            <span class="chip">Server-rendered shell</span>
            <span class="chip">Lit interactions</span>
            <span class="chip">Offer negotiation</span>
          </div>

          <div class="stats">
            <div class="stat">
              <div class="stat-label">Discovery</div>
              <div class="stat-value">Search-first</div>
            </div>
            <div class="stat">
              <div class="stat-label">Negotiation</div>
              <div class="stat-value">Offer flow</div>
            </div>
            <div class="stat">
              <div class="stat-label">Checkout</div>
              <div class="stat-value">Seller confirm</div>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}

customElements.define('marketplace-hero', MarketplaceHero);