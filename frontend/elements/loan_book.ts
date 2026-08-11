import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";

interface Book {
  id: number;
  name: string;
  isbn: number;
  in_stock: number;
  in_use: number;
}

interface Apprentice {
  id: number;
  name: string;
}

@customElement("app-loan-book")
export class LoanBookElement extends LitElement {
    @state()
    private books: Book[] = [];

    @state()
    private apprentices: Apprentice[] = [];

    @state()
    private selectedIsbn = 0;

    @state()
    private selectedApprenticeId = 0;

    @state()
    private statusMessage = "";

    @state()
    private isError = false;

    static styles?: CSSResultGroup = css`
      :host {
        display: block;
      }

      form {
        display: grid;
        gap: 1rem;
      }

      label {
        font-weight: 600;
      }

      input,
      select,
      textarea,
      button {
        width: 100%;
        padding: 0.85rem;
        border-radius: 12px;
        border: 1px solid #cbd5e1;
        font-size: 1rem;
        box-sizing: border-box;
        background: #ffffff;
      }

      button {
        background: #475569;
        color: #ffffff;
        border: none;
        cursor: pointer;
        border-radius: 9999px;
      }

      button:hover {
        background: #334155;
      }

      button:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      .status {
        padding: 1rem;
        border-radius: 12px;
      }

      .success {
        background: #dcfce7;
        color: #166534;
      }

      .error {
        background: #fee2e2;
        color: #991b1b;
      }

      .small-note {
        color: #475569;
        font-size: 0.95rem;
      }
    `;

    connectedCallback(): void {
      super.connectedCallback();
      this.loadOptions();
    }

    private async loadOptions() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Du må være logget inn.");

        const [booksResponse, apprenticesResponse] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/books", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://127.0.0.1:8000/api/apprentices", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const booksData = await booksResponse.json();
        const apprenticesData = await apprenticesResponse.json();

        if (!booksResponse.ok) throw new Error(booksData.detail || "Kunne ikke hente bøker.");
        if (!apprenticesResponse.ok) throw new Error(apprenticesData.detail || "Kunne ikke hente lærlinger.");

        this.books = booksData.books || [];
        this.apprentices = apprenticesData.apprentices || [];
        this.selectedIsbn = this.books.length ? this.books[0].isbn : 0;
        this.selectedApprenticeId = this.apprentices.length ? this.apprentices[0].id : 0;
      } catch (error) {
        this.statusMessage = error instanceof Error ? error.message : String(error);
        this.isError = true;
      }
    }

    private async handleSubmit(event: Event) {
      event.preventDefault();

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Du må være logget inn.");

        const response = await fetch("http://127.0.0.1:8000/api/loan_book", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isbn: this.selectedIsbn, apprentice_ID: this.selectedApprenticeId }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Utlån av bok feilet.");

        this.statusMessage = data.message || "Bok lånt ut.";
        this.isError = false;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.statusMessage = message;
        this.isError = true;
      }
    }

    private handleIsbnChange(event: Event) {
      this.selectedIsbn = parseInt((event.target as HTMLSelectElement).value, 10);
    }

    private handleApprenticeChange(event: Event) {
      this.selectedApprenticeId = parseInt((event.target as HTMLSelectElement).value, 10);
    }

    private renderBookOptions(): HTMLTemplateResult {
      return this.books.length > 0
        ? html`${this.books.map(
            (book) => html`<option value=${book.isbn}>${book.name} — ISBN ${book.isbn} (${book.in_stock} på lager)</option>`
          )}`
        : html`<option>Ingen bøker tilgjengelig</option>`;
    }

    private renderApprenticeOptions(): HTMLTemplateResult {
      return this.apprentices.length > 0
        ? html`${this.apprentices.map(
            (apprentice) => html`<option value=${apprentice.id}>${apprentice.name} (ID ${apprentice.id})</option>`
          )}`
        : html`<option>Ingen lærlinger registrert</option>`;
    }

    private renderStatus(): HTMLTemplateResult {
      return html`<div class="status ${this.isError ? "error" : "success"}">${this.statusMessage}</div>`;
    }

    protected render(): HTMLTemplateResult {
        return html`
            <form @submit=${this.handleSubmit}>
                <label for="isbn">Velg bok</label>
                <select id="isbn" @change=${this.handleIsbnChange}>
                    ${this.renderBookOptions()}
                </select>

                <label for="apprentice_ID">Velg lærling</label>
                <select id="apprentice_ID" @change=${this.handleApprenticeChange}>
                    ${this.renderApprenticeOptions()}
                </select>

                <button type="submit">Lån ut bok</button>
            </form>
            ${this.statusMessage ? this.renderStatus() : ""}
        `;
    }
}
