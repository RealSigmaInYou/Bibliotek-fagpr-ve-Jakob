import { css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("app-register-books")
export class registerBooksElement extends LitElement {
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

        const isbn = (form.querySelector("#isbn") as HTMLInputElement).value;
        const book_name = (form.querySelector("#book_name") as HTMLInputElement).value;
        const book_amount = (form.querySelector("#book_amount") as HTMLInputElement).value;

        try {

            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Du må logge inn for å få tilgang til denne funksjonen");
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
                throw new Error(data.detail || "Bok registrering feilet");
            }

        } catch (error) {
            alert(error)
            console.error(error);
            }
        alert("Bok registrert")
        window.location.reload();
        }

    protected render(): HTMLTemplateResult {
        return html`
            <form @submit=${this.handleSubmit}>
                <label for="isbn">ISBN</label>
                <input type="number" min="0" max="9799999999999" id="isbn" name="isbn" required>
                <!-- ISBN starter alltid 978 eller 979, men jeg tar meg ikke tid å sørge for at inputen følger ISBN formatet-->

                <label for="book_name">Navn på bok</label>
                <input type="text" id="book_name" name="book_name" required>

                <label for="book_amount">Antall kopier</label>
                <input type="number" min="1" id="book_amount" name="book_amount" required>

                <button type="submit">Registrer bok</button>
            </form>
        `;
    }
}