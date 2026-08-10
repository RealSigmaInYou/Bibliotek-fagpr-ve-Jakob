import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("app-return-item")
export class ReturnItemElement extends LitElement {
    @state()
    private statusMessage = "";

    @state()
    private isError = false;

    @state()
    private itemType: "book" | "pc" = "book";

    static styles?: CSSResultGroup = css`
    form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-width: 300px;
    }

    button {
        width: fit-content;
    }

    .status {
        margin-top: 0.75rem;
    }`;

    private async handleSubmit(event: Event) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const loan_id = parseInt((form.querySelector("#loan_id") as HTMLInputElement).value, 10);
        const endpoint = this.itemType === "book" ? "deliver_book" : "deliver_pc";

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No token found");

            const response = await fetch(`http://127.0.0.1:8000/api/${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ loan_id }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Return failed");

            this.statusMessage = data.message || "Return succeeded.";
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
                <label for="item_type">Item type</label>
                <select id="item_type" name="item_type" @change=${(event: Event) => {
                    this.itemType = (event.target as HTMLSelectElement).value as "book" | "pc";
                }}>
                    <option value="book">Book</option>
                    <option value="pc">PC</option>
                </select>

                <label for="loan_id">Loan ID</label>
                <input type="number" id="loan_id" name="loan_id" required />

                <button type="submit">Return item</button>
            </form>
            ${this.statusMessage
                ? html`<div class="status ${this.isError ? "error" : "success"}">${this.statusMessage}</div>`
                : ""}
        `;
    }
}
