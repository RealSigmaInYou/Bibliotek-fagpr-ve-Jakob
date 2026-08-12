import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";

interface PcItem {
  id: number;
  serial_number: string;
  device_name: string;
}

interface Apprentice {
  id: number;
  name: string;
}

@customElement("app-loan-pc")
export class LoanPcElement extends LitElement {
    @state()
    private pcs: PcItem[] = [];

    @state()
    private apprentices: Apprentice[] = [];

    @state()
    private selectedSerial = "";

    @state()
    private selectedApprenticeId = 0;

    @state()
    private statusMessage = "";


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

      .hint {
        margin: 0;
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

            const [pcsResponse, apprenticesResponse] = await Promise.all([
                fetch("http://127.0.0.1:8000/api/pcs", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch("http://127.0.0.1:8000/api/apprentices", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            const pcsData = await pcsResponse.json();
            const apprenticesData = await apprenticesResponse.json();

            if (!pcsResponse.ok) throw new Error(pcsData.detail || "Kunne ikke hente enheter.");
            if (!apprenticesResponse.ok) throw new Error(apprenticesData.detail || "Kunne ikke hente lærlinger.");

            this.pcs = pcsData.pcs || [];
            this.apprentices = apprenticesData.apprentices || [];
            this.selectedSerial = this.pcs.length ? this.pcs[0].serial_number : "";
            this.selectedApprenticeId = this.apprentices.length ? this.apprentices[0].id : 0;
        } catch (error) {
            this.statusMessage = error instanceof Error ? error.message : String(error);
            alert(this.statusMessage)
        }
        
    }

    private async handleSubmit(event: Event) {
        event.preventDefault();

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Du må være logget inn.");

            const response = await fetch("http://127.0.0.1:8000/api/loan_pc", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ serial_number: this.selectedSerial, apprentice_ID: this.selectedApprenticeId }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Utlån av enhet feilet.");

            this.statusMessage = data.message || "Enhet er lånt ut.";
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.statusMessage = message;
        }
        alert(this.statusMessage)
        window.location.reload();
    }

    private handleSerialChange(event: Event) {
        this.selectedSerial = (event.target as HTMLSelectElement).value;
    }

    private handleApprenticeChange(event: Event) {
        this.selectedApprenticeId = parseInt((event.target as HTMLSelectElement).value, 10);
    }

    private renderPcOptions(): HTMLTemplateResult {
        return this.pcs.length > 0
            ? html`${this.pcs.map(
                (pc) => html`<option value=${pc.serial_number}>${pc.device_name} — SN ${pc.serial_number}</option>`
            )}`
            : html`<option>Ingen enheter tilgjengelig</option>`;
    }

    private renderApprenticeOptions(): HTMLTemplateResult {
        return this.apprentices.length > 0
            ? html`${this.apprentices.map(
                (apprentice) => html`<option value=${apprentice.id}>${apprentice.name} (ID ${apprentice.id})</option>`
            )}`
            : html`<option>Ingen lærlinger registrert</option>`;
    }

    protected render(): HTMLTemplateResult {
        return html`
            <form @submit=${this.handleSubmit}>
                <label for="serial_number">Velg enhet</label>
                <select id="serial_number" @change=${this.handleSerialChange}>
                    ${this.renderPcOptions()}
                </select>

                <label for="apprentice_ID">Velg lærling</label>
                <select id="apprentice_ID" @change=${this.handleApprenticeChange}>
                    ${this.renderApprenticeOptions()}
                </select>

                <button type="submit">Lån ut enhet</button>
            </form>
        `;
    }

}
