import { LitElement, html, css } from 'lit';

class MarketplaceHero extends LitElement {
  static properties = {
    title: { type: String },
    subtitle: { type: String }
  };

  static styles = css`
    :host {
      display: block;
    }

    .hero {
      border-radius: var(--radius-2xl, 1.5rem);
      background:
        linear-gradient(135deg, rgba(95, 158, 169, 0.16), transparent 30%),
        linear-gradient(145deg, rgba(242, 193, 78, 0.12), transparent 40%),
        linear-gradient(180deg, var(--brand-navy) 0%, var(--brand-navy-deep) 100%);
      color: var(--brand-white, white);
      padding: 2rem;
      min-height: 240px;
      box-shadow: var(--shadow-card);
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
    }

    .meta {
      margin-top: 1.5rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .chip {
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.12);
      padding: 0.58rem 0.92rem;
      font-size: 0.8rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.95);
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
        <div class="eyebrow">Featured marketplace</div>
        <h2>${this.title}</h2>
        <p>${this.subtitle}</p>

        <div class="meta">
          <span class="chip">Server-rendered shell</span>
          <span class="chip">Lit interactions</span>
          <span class="chip">Offer negotiation</span>
        </div>
      </section>
    `;
  }
}

customElements.define('marketplace-hero', MarketplaceHero);