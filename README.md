# Formål
Systemet er utvikler for å gjøre det lettere for ansatte i Yrkesfaglig opplæring å holde styr på lån av pc-er og pensumbøker. Løsningen gjør det mulig å registrere pc-er og bøker, registrere lærlinger, låne pc-er og bøker til lærlinger, og registrere retur av pc-er og bøker fra lærlinger. 

# Omfang og arkitektur
Systemet består av:
-	En frontend
-	En backend API
-	En database
-	JWT basert autentisering og autorisering

## Frontend
Frontenden er ansvarlig for:
-	Innlogging
-	Registrering av bøker, PC-er og lærlinger
-	Tilbakelevering av PC-er og bøker
-	Fremvise aktive lån
-	Lage brukere
## Backend
Backenden er ansvarlig for:
-	Validering av data
-	Autentisering
-	DB-operasjoner
-	Forretingslogikk
## Database
-	Lagring av brukere, bøker, PC-er, lån, og lærlinger


# Teknologier
Løsningen er skrevet i HTML, TypeScript og Python, og bruker en PostgreSQL database.
| Teknologi       | Bruksområde                |
|-----------------|----------------------------|
| HTML            | Markup språk               |
| TypeScript      | Frontend logikk            |
| Lit             | Utvikling av web elementer |
| Node            | Frontend Runtime           |
| FastAPI         | Backend                    |
| Uvicorn         | Backend Runtime            |
| SQLAlchemy      | Database ORM               |
| JSON Web Tokens | Autentisering              |
| PostgreSQL      | Database                   |

# Autentisering og autorisering
Løsningen benytter seg av JWT (JSON Web Tokens) for autentisering

## Autentisering
Innlogging skjer ved at:
1.	Bruker sender brukernavn og passord
2.	Backend verifiserer at passord matcher lagret passord
3.	JWT blir generert
4.	Token blir gitt til bruker
5.	Token blir lagret i LocalStorage i brukeren sin nettleser

## Autorisering
Alle endepunkter bortsett fra:
-	/api/login
-	/api/health
krever en gyldig JWT-token.

### Roller:
Det er to roller i løsningen:
#### Saksbehandler:
Saksbehandlere har tilgang til å 
-	Registrere lærlinger, bøker, pc-er, bok-lån og pc-lån
-	Søke etter lærlinger, bøker, pc-er, bok-lån og pc-lån
-	Registrere tilbakeleveringer på bøker og pc-er
#### Admin:
Admin brukere har tilgang til alt saksbehandlere har tilgang til, men de kan også opprette brukere.

# Feilhåndtering:
| Situasjon                                                        | http-kode |
|------------------------------------------------------------------|-----------|
| Feil brukernavn eller passord                                    | 401       |
| Mangel på token                                                  | 401       |
| Mangler tilgang                                                  | 403       |
| Bok/pc/lån ikke funnet                                           | 404       |
| Registrerer bok/pc/lærling/lån som matcher noe annet i databasen | 409       |
| Prøver å returnere ett lån som allerede er returnert             | 409       |

# Drift
For å kjøre løsningen lokalt:
## Backend
For førstegangsoppsett er det anbefalt å sette opp ett virtuelt miljø for å isolere Python-avhengighetene.
Kjør: 
**python -m venv .venv**

Og så:
**.venv\scripts\activate.bat**
om du bruker ett CMD-vindu, eller:
**.venv\Scripts\Activate.ps1**
om du bruker ett PowerShell-vindu.

Gå inn i /backend fra prosjektmappen og så kjør:
**python -m pip install -r requirements.txt**

Og til slutt for å kjøre programmet:
**python -m uvicorn main:app --reload**

## Frontend
For frontend kjører du:
**npm ci**
For å laste ned dependencies
Og så
**npm run dev**
For å kjøre frontenden.

## .env
For at løsning skal funke må du også lage en fil i prosjektmappen som heter .env som inneholder:  \
postgres_pw = DITT_POSTGRESQL_PASSORD  \
db_name = DIN_DATABASE_SITT_NAVN  \
dev-secret = DIN_KJEMPE_HEMMELIGE_SECRET  \
JWT_SECRET = DIN_JWT_SECRET  

# Videreutvikling av løsningen  
Løsningen mangler:  
-	Login validering på alle sider som ikke er innloggingssiden.  
-	Logg ut funksjon som terminerer token  
-	Oversikt over hvem som er saksbehandler for lån  \
-	Oversikt over lån som snart går ut på dato  \
-	Vise historikk over lån  \

