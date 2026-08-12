import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("app-get-books")
export class AllBooksElement extends LitElement {
    @state()
    private books: Array<{ id: number; name: string; isbn: number; in_stock: number; in_use: number }> = [];

    @state()
    private statusMessage = "";

    @state()
    private isError = false;

    @state()
    private searchIsbn = "";

    @state()
    private searchName = "";

    static styles?: CSSResultGroup = css`
    form {
        display: grid;
        gap: 1rem;
        max-width: 320px;
        margin-bottom: 1rem;
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
        margin-top: 0.75rem;
    }

    ul {
        padding-left: 1.25rem;
    }

    li {
        margin-bottom: 0.25rem;
    }`;

    connectedCallback(): void {
        super.connectedCallback();
        this.loadBooks();
    }

    public async handleSearch(event: Event) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const isbn = (form.querySelector("#search_isbn") as HTMLInputElement).value;
        const bookName = (form.querySelector("#search_name") as HTMLInputElement).value;

        this.searchIsbn = isbn;
        this.searchName = bookName;
        await this.loadBooks(isbn, bookName);
    }
    
    public handleRefresh() {
        void this.loadBooks();
    }

    private async loadBooks(isbn?: string, bookName?: string) {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Du må logge inn for å få tilgang til denne funksjonen");

            const params = new URLSearchParams();
            if (isbn) params.append("isbn", isbn);
            if (bookName) params.append("book_name", bookName);

            const endpoint = params.toString()
                ? `http://127.0.0.1:8000/api/books/search?${params.toString()}`
                : "http://127.0.0.1:8000/api/books";

            const response = await fetch(endpoint, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Feilet å laste bøker");

            this.books = data.books || [];
            this.statusMessage = "";
            this.isError = false;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.statusMessage = message;
            this.isError = true;
        }
    }

    private renderStatus(): HTMLTemplateResult {
        return html`<div class="status ${this.isError ? "error" : "success"}">${this.statusMessage}</div>`;
    }

    private renderBookList(): HTMLTemplateResult {
        return html`
            <ul>
                ${this.books.map(
                    (book) => html`<li>${book.name} (ISBN ${book.isbn}) — in stock: ${book.in_stock}, in use: ${book.in_use}</li>`
                )}
            </ul>
        `;
    }

    protected render(): HTMLTemplateResult {
        return html`
            <form @submit=${this.handleSearch}>
                <label for="search_isbn">Søk etter ISBN</label>
                <input type="number" id="search_isbn" name="search_isbn" .value=${this.searchIsbn} />
                <p>eller</p>
                <label for="search_name">Søk etter navn på bok</label>
                <input type="text" id="search_name" name="search_name" .value=${this.searchName} />

                <button type="submit">Søk etter bok</button>
            </form>

            <button @click=${this.handleRefresh}>Oppdater bokliste</button>
            ${this.statusMessage ? this.renderStatus() : ""}
            ${this.renderBookList()}
        `;
    }
}

