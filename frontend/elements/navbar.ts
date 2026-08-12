import {css, html, LitElement, type CSSResultGroup, type HTMLTemplateResult } from "lit";
import { customElement} from "lit/decorators.js";

@customElement("nav-bar")
export class NavBarElement extends LitElement {
    static styles: CSSResultGroup = css`
        body { 
            margin: 0; 
            background: #d8dade; color: #111827; 
        }
        header { 
            background: white; 
            padding: 1rem 1.5rem; 
            border-bottom: 1px solid #e5e7eb; 
        }
        nav { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 0.75rem; 
            margin-top: 0.75rem; 
        }
        nav a { 
            color: #3f4f71; 
            text-decoration: none; 
        }
        nav a:hover { 
            text-decoration: underline; 
        }
        main { 
            max-width: 660px; 
            margin: 1.5rem auto; 
            padding: 0 1.5rem; 
        }
        section { 
            background: white; 
            border-radius: 1rem; 
            padding: 1.5rem;
        }
        h1 { 
            margin-top: 0; 
        }
    `
    protected render(): HTMLTemplateResult {
        return html`
        
        <nav>
            <a href="./login.html">Innlogging</a>
            <a href="./index.html">Hjem</a>
            <a href="./books.html">Bøker</a>
            <a href="./devices.html">Enheter</a>
            <a href="./loan_book.html">Lån ut bok</a>
            <a href="./loan_device.html">Lån ut enhet</a>
            <a href="./apprentices.html">Registrer lærlinger</a>
            <a href="./create_user.html">Lag bruker</a>
        </nav>
        `   
    }
}