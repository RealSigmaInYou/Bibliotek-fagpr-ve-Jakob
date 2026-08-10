import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("app-register-books")
export class registerBooksElement extends LitElement {
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

        const isbn = (form.querySelector("#isbn") as HTMLInputElement).value;
        const book_name = (form.querySelector("#book_name") as HTMLInputElement).value;
        const book_amount = (form.querySelector("#book_amount") as HTMLInputElement).value;

        try {

            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No token found");
            }

            const response = await fetch("http://127.0.0.1:8000/api/register_book", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(
                {
                "isbn": isbn,
                "book_name": book_name,
                "amount": book_amount,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Book registration failed");
            }

        } catch (error) {
            alert(error)
            console.error(error);
            }
        }

    protected render(): HTMLTemplateResult {
        return html`
            <form @submit=${this.handleSubmit}>
                <label for="isbn">Serial number</label>
                <input type="number" min="0" max="9799999999999" id="isbn" name="isbn" required> 
                <!-- ISBN starter alltid 978 eller 979, men jeg tar meg ikke tid å sørge for at inputen følger ISBN formatet-->

                <label for="book_name">Book name</label>
                <input type="text" id="book_name" name="book_name" required>

                <label for="book_amount">Number of copies</label>
                <input type="number" id="book_amount" name="book_amount" required>

                <button type="submit">Register device</button>
            </form>
        `;
    }
}