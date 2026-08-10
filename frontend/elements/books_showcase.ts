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

    static styles?: CSSResultGroup = css`
    button {
        width: fit-content;
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

    private async loadBooks() {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No token found");

            const response = await fetch("http://127.0.0.1:8000/api/books", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Failed to load books");

            this.books = data.books || [];
            this.statusMessage = "";
            this.isError = false;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.statusMessage = message;
            this.isError = true;
        }
    }

    protected render(): HTMLTemplateResult {
        return html`
            <button @click=${this.loadBooks}>Refresh books</button>
            ${this.statusMessage
                ? html`<div class="status ${this.isError ? "error" : "success"}">${this.statusMessage}</div>`
                : ""}
            <ul>
                ${this.books.map(
                    (book) => html`<li>${book.name} (ISBN ${book.isbn}) — in stock: ${book.in_stock}, in use: ${book.in_use}</li>`
                )}
            </ul>
        `;
    }
}

