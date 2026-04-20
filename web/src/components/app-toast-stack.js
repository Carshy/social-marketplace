import { LitElement, html, css } from 'lit';

class AppToastStack extends LitElement {
  static properties = {
    toasts: { state: true }
  };

  static styles = css`
    :host {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: block;
      pointer-events: none;
    }

    .stack {
      display: grid;
      gap: 0.75rem;
      width: min(360px, calc(100vw - 2rem));
    }

    .toast {
      pointer-events: auto;
      border-radius: 1rem;
      border: 1px solid var(--brand-line, #d7e1ea);
      background: var(--brand-white, #ffffff);
      box-shadow: 0 18px 40px rgba(16, 33, 58, 0.14);
      padding: 0.95rem 1rem;
      animation: slideIn 0.2s ease;
    }

    .toast.success {
      background: var(--brand-success-bg, #eaf9f0);
      color: var(--brand-success-text, #166534);
      border-color: rgba(22, 101, 52, 0.18);
    }

    .toast.error {
      background: var(--brand-danger-bg, #fff1f2);
      color: var(--brand-danger-text, #9f1239);
      border-color: rgba(159, 18, 57, 0.18);
    }

    .toast.info {
      background: var(--brand-info-bg, #eef6ff);
      color: var(--brand-info-text, #1d4ed8);
      border-color: rgba(29, 78, 216, 0.16);
    }

    .title {
      font-size: 0.82rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      opacity: 0.85;
    }

    .message {
      margin-top: 0.35rem;
      font-size: 0.92rem;
      line-height: 1.55;
      font-weight: 700;
    }

    .close {
      margin-top: 0.65rem;
      border: none;
      background: transparent;
      color: inherit;
      font: inherit;
      font-weight: 800;
      cursor: pointer;
      padding: 0;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-8px) translateX(6px);
      }
      to {
        opacity: 1;
        transform: translateY(0) translateX(0);
      }
    }
  `;

  constructor() {
    super();
    this.toasts = [];
    this._toastHandler = this.handleToast.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('marketplace-toast', this._toastHandler);
  }

  disconnectedCallback() {
    window.removeEventListener('marketplace-toast', this._toastHandler);
    super.disconnectedCallback();
  }

  handleToast(event) {
    const detail = event.detail || {};
    const toast = {
      id: crypto.randomUUID(),
      type: detail.type || 'info',
      title: detail.title || '',
      message: detail.message || 'Something happened.'
    };

    this.toasts = [...this.toasts, toast];

    window.setTimeout(() => {
      this.dismissToast(toast.id);
    }, 3200);
  }

  dismissToast(id) {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
  }

  render() {
    if (!this.toasts.length) return html``;

    return html`
      <div class="stack" aria-live="polite" aria-atomic="true">
        ${this.toasts.map(
          (toast) => html`
            <div class="toast ${toast.type}">
              ${toast.title
                ? html`<div class="title">${toast.title}</div>`
                : ''}
              <div class="message">${toast.message}</div>
              <button class="close" @click=${() => this.dismissToast(toast.id)}>
                Dismiss
              </button>
            </div>
          `
        )}
      </div>
    `;
  }
}

customElements.define('app-toast-stack', AppToastStack);