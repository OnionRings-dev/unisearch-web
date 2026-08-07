# UniSearch Web

Frontend React/Vite di UniSearch, distribuito come applicazione statica tramite Nginx. Il container espone la porta `80`, risponde su `/health` e mantiene un proxy `/api/*` verso il servizio interno `unisearch-api:8000` per gli ambienti in cui il traffico passa da Nginx.

Questo repository non include una licenza open source. Il codice rimane soggetto a tutti i diritti riservati dei rispettivi titolari.

## Requisiti

- Node.js 22 e npm;
- Docker, opzionale per provare l'immagine di produzione;
- UniSearch API sulla porta locale `8000` durante lo sviluppo.

I video dimostrativi non sono inclusi nel repository. Se in futuro vengono
aggiunti file `.mov`, devono essere gestiti tramite Git LFS come configurato in
`.gitattributes`.

## Sviluppo locale

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Vite pubblica normalmente il sito su `http://localhost:5173` e inoltra `/api` a `http://localhost:8000`, rimuovendo il prefisso. Per i controlli prima di una pull request:

```bash
npm run lint
npm run build
```

`VITE_API_URL` è una variabile di build: una modifica richiede una nuova build degli asset. Il valore consigliato è `/api`, così browser, OAuth e richieste streaming restano sullo stesso host.

## Container

```bash
docker build --build-arg VITE_API_URL=/api -t unisearch-web .
docker run --rm -p 8080:80 --network unisearch-production unisearch-web
```

Il container richiede che sulla stessa rete Docker il backend sia raggiungibile con alias `unisearch-api`. Nel workspace completo, avviare invece i servizi dal repository fratello `unisearch-platform`.

Endpoint operativi:

| Endpoint | Scopo |
|---|---|
| `GET /health` | Healthcheck Nginx, risposta `200 ok` |
| `/api/*` | Proxy verso `http://unisearch-api:8000/*` |
| `/*` | Single-page application con fallback a `index.html` |

In produzione Dokploy può instradare `/` a questa applicazione e `/api` direttamente a `unisearch-api`, applicando lo strip del prefisso. Il proxy Nginx resta disponibile per lo sviluppo locale e per deployment su un solo ingresso.

## Deploy Dokploy

Collega l'Application direttamente a questa repository sul branch `main`, usa il
`Dockerfile` nella root e abilita Auto Deploy. Ogni aggiornamento di `main`
avvia build e deploy di `unisearch-web` direttamente in Dokploy; non sono
richieste credenziali Dokploy nelle impostazioni GitHub.

Prima di attivare le regole CODEOWNERS, copiare `.github/CODEOWNERS.template` in `.github/CODEOWNERS` e sostituire i placeholder con almeno due persone reali per area critica.

## Collaborazione

Le regole per branch, pull request e review sono in [CONTRIBUTING.md](CONTRIBUTING.md). Le vulnerabilità non devono essere pubblicate nelle issue: seguire [SECURITY.md](SECURITY.md).
