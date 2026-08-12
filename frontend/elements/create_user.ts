import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("app-create-user")
export class CreateUserElement extends LitElement {
  static styles?: CSSResultGroup = css`
    form {
      display: grid;
      gap: 1rem;
      max-width: 360px;
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
    const repeat_password = (form.querySelector("#repeat_password") as HTMLInputElement).value;


    /*
    Sjekker om at passordet er skrevet likt i begge feltene.
    Om det er, prøver den å hente JWT i localStorage siden at det er der
    den ligger når man logger inn.
    
    
    
    */
    if (password === repeat_password) {
      try {
        const role = (form.querySelector("#role") as HTMLSelectElement).value;
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Du må være logget inn.");
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/create_user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ username, password, role }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Opprettelse av bruker feilet");
        }

        alert("Bruker opprettet");
        form.reset();
      } catch (error) {
        alert(error instanceof Error ? error.message : String(error));
        console.error(error);
      }
    } else {
      alert("Passordene er ikke like");
    }
  }

  protected render(): HTMLTemplateResult {
    return html`
      <form @submit=${this.handleSubmit}>
        <label for="username">Brukernavn</label>
        <input type="text" id="username" name="username" required />

        <label for="password">Passord</label>
        <input type="password" id="password" name="password" required />

        <label for="repeat_password">Gjenta passord</label>
        <input type="password" id="repeat_password" name="repeat_password" required />

        <label for="role">Rolle</label>
        <select id="role" name="role">
          <option value="saksbehandler">Saksbehandler</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit">Opprett bruker</button>
      </form>
    `;
  }
}