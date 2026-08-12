import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("app-register-apprentice")
export class registerApprenticeElement extends LitElement {
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
        const name = (form.querySelector("#name") as HTMLInputElement).value;
        const email = (form.querySelector("#email") as HTMLInputElement).value;
        const apprenticeship_start = (form.querySelector("#apprenticeship_start") as HTMLInputElement).value
        const apprenticeship_end = (form.querySelector("#apprenticeship_end") as HTMLInputElement).value


        console.log(name, email, apprenticeship_start, apprenticeship_end)

        try {

            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Du må logge inn for å få tilgang til denne funksjonen");
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/register_apprentice`, {
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
                throw new Error(data.detail || "Lærling registrering feilet");
            }

        } catch (error) {
            alert(error)
            console.error(error);
            }
        alert("Lærling registrert")
        }

    protected render(): HTMLTemplateResult {
        return html`
            <form @submit=${this.handleSubmit}>
                <label for="name">Lærlingens navn</label>
                <input type="text" id="name" name="Name" required>

                <label for="email">Lærlingens epost</label>
                <input type="email" id="email" name="email" required>

                <label for="apprenticeship_start">Læretid start</label>
                <input type="date" id="apprenticeship_start" name="apprenticeship_start" required>

                <label for="apprenticeship_end">Læretid slutt</label>
                <input type="date" id="apprenticeship_end" name="apprenticeship_end" required>

                <button type="submit">Registrer lærling</button>
            </form>
        `;
    }
}