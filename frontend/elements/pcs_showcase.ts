import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("app-get-pcs")
export class AllPcsElement extends LitElement {
    @state()
    private pcs: Array<{ id: number; serial_number: string; device_name: string }> = [];

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
    }`;

    connectedCallback(): void {
        super.connectedCallback();
        this.loadPcs();
    }

    private async loadPcs() {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No token found");

            const response = await fetch("http://127.0.0.1:8000/api/pcs", {
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
            this.isError = false;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.statusMessage = message;
            this.isError = true;
        }
    }

    protected render(): HTMLTemplateResult {
        return html`
            <button @click=${this.loadPcs}>Refresh PCs</button>
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

@customElement("app-search-pcs")
export class SearchPcsElement extends LitElement {
    @state()
    private pcs: Array<{ id: number; serial_number: string; device_name: string }> = [];

    @state()
    private statusMessage = "";

    @state()
    private isError = false;

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
            if (!token) throw new Error("No token found");

            const response = await fetch(`http://127.0.0.1:8000/api/pcs/search?${params.toString()}`, {
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
            this.isError = false;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.statusMessage = message;
            this.isError = true;
        }
    }

    protected render(): HTMLTemplateResult {
        return html`
            <form @submit=${this.handleSearch}>
                <label for="search_serial">Serial number</label>
                <input type="text" id="search_serial" name="search_serial" />

                <label for="search_device">Device name</label>
                <input type="text" id="search_device" name="search_device" />

                <button type="submit">Search PCs</button>
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
