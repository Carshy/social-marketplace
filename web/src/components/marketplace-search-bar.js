import { LitElement, html, css } from 'lit';

class MarketplaceSearchBar extends LitElement {
  static properties = {
    placeholder: { type: String },
    value: { state: true }
  };

  static styles = css`
    :host {
      display: block;
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
      margin-top: 0.75rem;
      font-size: 0.85rem;
      color: var(--brand-muted);
      line-height: 1.6;
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

  render() {
    return html`
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
        Search updates the marketplace grid below using the backend keyword filter.
      </p>
    `;
  }
}

customElements.define('marketplace-search-bar', MarketplaceSearchBar);