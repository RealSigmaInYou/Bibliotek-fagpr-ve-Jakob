import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("app-create-user")
export class LoginElement extends LitElement {
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
    if (password == repeat_password) {
      try {
        const role = (form.querySelector("#role") as HTMLSelectElement).value;
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No token found");
        }

        const response = await fetch("http://127.0.0.1:8000/api/create_user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ username, password, role }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "User creation failed");
        }

        console.log("User creation successful");
      } catch (error) {
        console.error(error);
      }
    }
    else  {
      alert("Passwords do not match")
      console.log("Passwords do not match")

  }}

  protected render(): HTMLTemplateResult {
    return html`
      <form @submit=${this.handleSubmit}>
        <label for="username">Username</label>
        <input type="text" id="username" name="username" required>

        <label for="password">Password</label>
        <input type="password" id="password" name="password" required>

        <label for="repeat-password">Repeat password</label>
        <input type="password" id="repeat_password" name="repeat_password" required>

        <label for="role">Role</label>
        <select id="role" name="role">
          <option value="saksbehandler">Saksbehandler</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit">Create user</button>
      </form>
    `;
  }
}