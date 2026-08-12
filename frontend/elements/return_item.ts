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

    @state()
    private activeLoans: Array<{ loan_id: number; label: string }> = [];

    @state()
    private selectedLoanId = 0;

    @state()
    private loadingLoans = false;

    static styles?: CSSResultGroup = css`
    form {
        display: grid;
        gap: 1rem;
        max-width: 300px;
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
    }`;

    connectedCallback(): void {
        super.connectedCallback();
        void this.loadLoans();
    }

    private async loadLoans() {
        this.loadingLoans = true;
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Du må logge inn for å få tilgang til denne funksjonen");

            const endpoint = this.itemType === "book" ? "active_book_loans" : "active_pc_loans";
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/${endpoint}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Failed to load active loans");

            this.activeLoans = (data.active_loans || []).map((loan: any) => ({
                loan_id: loan.loan_id,
                label:
                    this.itemType === "book"
                        ? `ID ${loan.loan_id} – ${loan.title} – ${loan.borrower_name}`
                        : `ID ${loan.loan_id} – ${loan.device_name} – ${loan.borrower_name}`,
            }));

            this.selectedLoanId = this.activeLoans.length ? this.activeLoans[0].loan_id : 0;
        } catch (error) {
            this.activeLoans = [];
            this.selectedLoanId = 0;
            this.statusMessage = error instanceof Error ? error.message : String(error);
            this.isError = true;
        } finally {
            this.loadingLoans = false;
        }
    }

    private async handleSubmit(event: Event) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;

        if (!this.selectedLoanId) {
            this.statusMessage = "Velg et aktivt lån før du leverer tilbake.";
            this.isError = true;
            return;
        }

        const endpoint = this.itemType === "book" ? "deliver_book" : "deliver_pc";

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Du må logge inn for å få tilgang til denne funksjonen");

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ loan_id: this.selectedLoanId }),
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

    private async handleItemTypeChange(event: Event) {
        this.itemType = (event.target as HTMLSelectElement).value as "book" | "pc";
        this.activeLoans = [];
        this.selectedLoanId = 0;
        this.statusMessage = "";
        this.isError = false;
        await this.loadLoans();
    }

    private handleLoanChange(event: Event) {
        this.selectedLoanId = parseInt((event.target as HTMLSelectElement).value, 10);
    }

    /*sjekker om at lån bli lastet, skriver at den laster lån om sann
    og så sjekker om at det ikke finnes noen aktivelån
    til slutt legger til ett select element som inneholder alle lån basert på hva det er som er valgt i optionen item_type
    */
    private renderLoanSelector(): HTMLTemplateResult {
        if (this.loadingLoans) {
            return html`<div>Laster lån...</div>`;
        }

        if (!this.activeLoans.length) {
            return html`<div>Ingen aktive lån funnet for valgt type.</div>`;
        }

        return html`
            <select id="loan_id" name="loan_id" @change=${this.handleLoanChange}>
                ${this.activeLoans.map(
                    (loan) => html`<option value=${loan.loan_id} ?selected=${loan.loan_id === this.selectedLoanId}>${loan.label}</option>`
                )}
            </select>
        `;
    }

    private renderStatus(): HTMLTemplateResult {
        return html`<div class="status ${this.isError ? "error" : "success"}">${this.statusMessage}</div>`;
    }

    protected render(): HTMLTemplateResult {
        return html`
            <form @submit=${this.handleSubmit}>
                <label for="item_type">Utstyr type</label>
                <select id="item_type" name="item_type" @change=${this.handleItemTypeChange}>
                    <option value="book" ?selected=${this.itemType === "book"}>Book</option>
                    <option value="pc" ?selected=${this.itemType === "pc"}>PC</option>
                </select>

                <label for="loan_id">Velg lån</label>
                ${this.renderLoanSelector()}

                <button type="submit" ?disabled=${!this.activeLoans.length}>Returner utstyr</button>
            </form>
            ${this.statusMessage ? this.renderStatus() : ""}
        `;
    }
}
