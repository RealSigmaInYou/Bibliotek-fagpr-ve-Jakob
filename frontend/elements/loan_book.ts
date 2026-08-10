import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("app-loan-book")
export class LoanBookElement extends LitElement {
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
    }`;

    private async handleSubmit(event: Event) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const isbn = parseInt((form.querySelector("#isbn") as HTMLInputElement).value, 10);
        const apprentice_ID = parseInt((form.querySelector("#apprentice_ID") as HTMLInputElement).value, 10);
        const case_responsable = parseInt((form.querySelector("#case_responsable") as HTMLInputElement).value, 10);

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No token found");

            const response = await fetch("http://127.0.0.1:8000/api/loan_book", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ isbn, apprentice_ID, case_responsable }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Book loan failed");

            this.statusMessage = data.message || "Book loan succeeded.";
            this.isError = false;
            form.reset();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.statusMessage = message;
            this.isError = true;
            console.error(error);
        }
    }

    protected render(): HTMLTemplateResult {
        return html`
            <form @submit=${this.handleSubmit}>
                <label for="isbn">Book ISBN</label>
                <input type="number" id="isbn" name="isbn" required />

                <label for="apprentice_ID">Apprentice ID</label>
                <input type="number" id="apprentice_ID" name="apprentice_ID" required />

                <label for="case_responsable">Case responsible user ID</label>
                <input type="number" id="case_responsable" name="case_responsable" required />

                <button type="submit">Loan book</button>
            </form>
            ${this.statusMessage
                ? html`<div class="status ${this.isError ? "error" : "success"}">${this.statusMessage}</div>`
                : ""}
        `;
    }
}
