import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("app-register-device")
export class registerDeviceElement extends LitElement {
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
      color: white;
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
    }`;

    private async handleSubmit(event: Event) {
        event.preventDefault();

        const form = event.target as HTMLFormElement;
        const serial_number = (form.querySelector("#serial_number") as HTMLInputElement).value;
        const device_name = (form.querySelector("#device_name") as HTMLInputElement).value;

        try {

            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Du må logge inn for å få tilgang til denne funksjonen");
            }

            const response = await fetch("http://127.0.0.1:8000/api/register_pc", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(
                {
                "serial_number": serial_number,
                "device_name": device_name,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Enhets registrering feilet");
            }

        } catch (error) {
            alert(error)
            console.error(error);
            }
        window.location.reload();
        }

    protected render(): HTMLTemplateResult {
        return html`
            <form @submit=${this.handleSubmit}>
                <label for="serial_number">Serienummer</label>
                <input type="text" id="serial_number" name="serial_number" required>

                <label for="device_name">Enhetsnavn</label>
                <input type="text" id="device_name" name="device_name" required>

                <button type="submit">Registrer enhet</button>
            </form>
        `;
    }
}