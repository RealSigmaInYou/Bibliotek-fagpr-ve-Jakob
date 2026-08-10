import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("app-register-device")
export class registerDeviceElement extends LitElement {
    static styles?: CSSResultGroup = css`
    form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-width: 300px;
    }

    button {
        width: fit-content;
    }`;

    private async handleSubmit(event: Event) {
        event.preventDefault();

        const form = event.target as HTMLFormElement;
        const serial_number = (form.querySelector("#serial_number") as HTMLInputElement).value;
        const device_name = (form.querySelector("#device_name") as HTMLInputElement).value;

        try {

            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No token found");
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
                throw new Error(data.detail || "Device registration failed");
            }

        } catch (error) {
            alert(error)
            console.error(error);
            }
        }

    protected render(): HTMLTemplateResult {
        return html`
            <form @submit=${this.handleSubmit}>
                <label for="serial_numer">Serial number</label>
                <input type="text" id="serial_number" name="serial_number" required>

                <label for="device_name">Device name</label>
                <input type="text" id="device_name" name="device_name" required>

                <button type="submit">Register device</button>
            </form>
        `;
    }
}