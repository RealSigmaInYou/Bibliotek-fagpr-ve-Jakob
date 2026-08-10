import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("app-login")
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

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      localStorage.setItem("token", data.token);
      console.log("Login successful");

    } catch (error) {
      alert("Username or password is incorrect")
      console.error(error);
    }
  }

  protected render(): HTMLTemplateResult {
    return html`
      <form @submit=${this.handleSubmit}>
        <label for="username">Username</label>
        <input type="text" id="username" name="username" required>

        <label for="password">Password</label>
        <input type="password" id="password" name="password" required>

        <button type="submit">Login</button>
      </form>
    `;
  }
}