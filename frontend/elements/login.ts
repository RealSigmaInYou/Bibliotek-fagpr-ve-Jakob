import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("app-login")
export class LoginElement extends LitElement {
  static styles?: CSSResultGroup = css`
    form {
      display: grid;
      gap: 1rem;
      max-width: 340px;
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
  `;

  private async handleSubmit(event: Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const username = (form.querySelector("#username") as HTMLInputElement).value;
    const password = (form.querySelector("#password") as HTMLInputElement).value;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Innlogging feilet");
      }

      localStorage.setItem("token", data.token);
      alert("Innlogging vellykket");
    } catch (error) {
      alert("Brukernavn eller passord er feil");
      console.error(error);
    }
  }

  protected render(): HTMLTemplateResult {
    return html`
      <form @submit=${this.handleSubmit}>
        <label for="username">Brukernavn</label>
        <input type="text" id="username" name="username" required />

        <label for="password">Passord</label>
        <input type="password" id="password" name="password" required />

        <button type="submit">Logg inn</button>
      </form>
    `;
  }
}