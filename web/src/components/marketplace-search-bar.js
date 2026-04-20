import { LitElement, html, css } from 'lit';

class MarketplaceSearchBar extends LitElement {
  static properties = {
    placeholder: { type: String },
    value: { state: true }
  };

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }

    .shell {
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .search-shell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border: 1px solid var(--brand-line);
      border-radius: 1.1rem;
      padding: 0.95rem 1rem;
      background: var(--brand-white);
      box-shadow: var(--shadow-soft);
    }

    .icon {
      font-size: 1rem;
      color: var(--brand-teal);
    }

    input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 1rem;
      background: transparent;
      color: var(--brand-ink);
    }

    input::placeholder {
      color: #90a1b5;
    }

    .hint {
      font-size: 0.88rem;
      color: var(--brand-muted);
      line-height: 1.6;
    }

    .insights {
      flex: 1;
      min-height: 0;
      display: grid;
      gap: 0.85rem;
      align-content: start;
    }

    .info-card {
      border-radius: 1rem;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 248, 251, 0.96));
      border: 1px solid rgba(215, 225, 234, 0.85);
      padding: 0.95rem 1rem;
    }

    .info-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: var(--brand-teal);
      font-weight: 800;
    }

    .info-value {
      margin-top: 0.42rem;
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--brand-ink);
      line-height: 1.5;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
    }

    .chip {
      border-radius: 999px;
      background: var(--brand-soft-2);
      color: var(--brand-teal);
      border: 1px solid rgba(215, 225, 234, 0.75);
      padding: 0.5rem 0.78rem;
      font-size: 0.78rem;
      font-weight: 800;
      cursor: pointer;
    }
  `;

  constructor() {
    super();
    this.placeholder = 'Search items...';
    this.value = '';
    this._timer = null;
  }

  emitSearch(query) {
    window.dispatchEvent(
      new CustomEvent('marketplace-search-change', {
        detail: { query }
      })
    );
  }

  handleInput(event) {
    this.value = event.target.value;

    clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      this.emitSearch(this.value.trim());
    }, 250);
  }

  applyQuickSearch(term) {
    this.value = term;
    this.emitSearch(term);
  }

  render() {
    return html`
      <div class="shell">
        <div class="search-shell" role="search">
          <span class="icon">🔎</span>
          <input
            type="search"
            .value=${this.value}
            placeholder=${this.placeholder}
            @input=${this.handleInput}
            aria-label="Search marketplace items"
          />
        </div>

        <p class="hint">
          Search updates the marketplace grid in real time using the backend keyword filter.
        </p>

        <div class="insights">
          <div class="info-card">
            <div class="info-label">Search behaviour</div>
            <div class="info-value">
              Matches listing names and descriptions so buyers can discover items faster.
            </div>
          </div>

          <div class="info-card">
            <div class="info-label">Quick searches</div>
            <div class="chips">
              <button class="chip" @click=${() => this.applyQuickSearch('comic')}>Comic</button>
              <button class="chip" @click=${() => this.applyQuickSearch('batman')}>Batman</button>
              <button class="chip" @click=${() => this.applyQuickSearch('pokemon')}>Pokemon</button>
              <button class="chip" @click=${() => this.applyQuickSearch('rare')}>Rare</button>
            </div>
          </div>

          <div class="info-card">
            <div class="info-label">Experience goal</div>
            <div class="info-value">
              Help buyers move from discovery to negotiation without friction.
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('marketplace-search-bar', MarketplaceSearchBar);