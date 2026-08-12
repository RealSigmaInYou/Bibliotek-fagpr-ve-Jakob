import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("app-get-pcs")
export class AllPcsElement extends LitElement {
    @state()
    private pcs: Array<{ id: number; serial_number: string; device_name: string }> = [];

    @state()
    private statusMessage = "";

    static styles?: CSSResultGroup = css`
    button,
    input,
    select,
    textarea {
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
    }`;

    connectedCallback(): void {
        super.connectedCallback();
        this.loadPcs();
    }

    private async loadPcs() {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Du må logge inn for å få tilgang til denne funksjonen");

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pcs`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Failed to load PCs");

            this.pcs = data.pcs || [];
            this.statusMessage = "";
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.statusMessage = message;
        }
    }

    private handleRefresh() {
        void this.loadPcs();
    }

    private renderStatus(): HTMLTemplateResult {
        return html`<div class="status">${this.statusMessage}</div>`;
    }

    private renderPcList(): HTMLTemplateResult {
        return html`
            <ul>
                ${this.pcs.map(
                    (pc) => html`<li>${pc.device_name} (SN ${pc.serial_number})</li>`
                )}
            </ul>
        `;
    }

    protected render(): HTMLTemplateResult {
        return html`
            <button @click=${this.handleRefresh}>Oppdater enhetsliste</button>
            ${this.statusMessage ? this.renderStatus() : ""}
            ${this.renderPcList()}
        `;
    }
}

@customElement("app-search-pcs")
export class SearchPcsElement extends LitElement {
    @state()
    private pcs: Array<{ id: number; serial_number: string; device_name: string }> = [];

    @state()
    private statusMessage = "";

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
    }

    ul {
        padding-left: 1.25rem;
    }`;

    private async handleSearch(event: Event) {
        event.preventDefault();

        const form = event.target as HTMLFormElement;
        const serialNumber = (form.querySelector("#search_serial") as HTMLInputElement).value;
        const deviceName = (form.querySelector("#search_device") as HTMLInputElement).value;

        try {
            const params = new URLSearchParams();
            if (serialNumber) params.set("serial_number", serialNumber);
            if (deviceName) params.set("device_name", deviceName);

            const token = localStorage.getItem("token");
            if (!token) throw new Error("Du må logge inn for å få tilgang til denne funksjonen");

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pcs/search?${params.toString()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Failed to search PCs");

            this.pcs = data.pcs || [];
            this.statusMessage = "";
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.statusMessage = message;
        }
    }

    protected render(): HTMLTemplateResult {
        return html`
            <form @submit=${this.handleSearch}>
                <label for="search_serial">Søk etter serienummer</label>
                <input type="text" id="search_serial" name="search_serial" />
                <p>eller</p>
                <label for="search_device">Søk etter enhetnavn</label>
                <input type="text" id="search_device" name="search_device" />

                <button type="submit">Søk etter enhet</button>
            </form>
            ${this.statusMessage
                ? html`<div class="status">${this.statusMessage}</div>`
                : ""}
            <ul>
                ${this.pcs.map(
                    (pc) => html`<li>${pc.device_name} (SN ${pc.serial_number})</li>`
                )}
            </ul>
        `;
    }
}
