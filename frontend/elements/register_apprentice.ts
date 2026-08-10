import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("app-register-apprentice")
export class registerApprenticeElement extends LitElement {
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
        const name = (form.querySelector("#name") as HTMLInputElement).value;
        const email = (form.querySelector("#email") as HTMLInputElement).value;
        const apprenticeship_start = (form.querySelector("#apprenticeship_start") as HTMLInputElement).value
        const apprenticeship_end = (form.querySelector("#apprenticeship_end") as HTMLInputElement).value


        console.log(name, email, apprenticeship_start, apprenticeship_end)

        try {

            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No token found");
            }

            const response = await fetch("http://127.0.0.1:8000/api/register_apprentice", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(
                {
                "name": name,
                "email": email,
                "apprenticeship_start": apprenticeship_start,
                "apprenticeship_end": apprenticeship_end,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Apprentice registration failed");
            }

        } catch (error) {
            alert(error)
            console.error(error);
            }
        }

    protected render(): HTMLTemplateResult {
        return html`
            <form @submit=${this.handleSubmit}>
                <label for="name">Apprentice name</label>
                <input type="text" id="name" name="Name" required>

                <label for="email">Apprentice email</label>
                <input type="email" id="email" name="email" required>

                <label for="apprenticeship_start">Apprenticeship start date</label>
                <input type="date" id="apprenticeship_start" name="apprenticeship_start" required>

                <label for="apprenticeship_end">Apprenticeship end date</label>
                <input type="date" id="apprenticeship_end" name="apprenticeship_end" required>

                <button type="submit">Register apprentice</button>
            </form>
        `;
    }
}