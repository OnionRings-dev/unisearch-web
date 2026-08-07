# Contribuire a UniSearch Web

## Flusso di lavoro

1. Sincronizza `main` e crea un branch breve, per esempio `feat/nome-modifica` o `fix/nome-bug`.
2. Installa esattamente le dipendenze bloccate con `npm ci`.
3. Mantieni le richieste all'API sotto `/api`; non inserire host di produzione nel codice.
4. Esegui `npm run lint` e `npm run build`.
5. Apri una pull request piccola, descrivendo comportamento, verifica manuale ed eventuali cambi di contratto con l'API.

Non committare `.env`, credenziali, `node_modules` o `dist`. I file `.mov` devono passare da Git LFS.

## Review

`main` deve essere protetto da un ruleset GitHub con pull request obbligatoria,
almeno un'approvazione, conversazioni risolte e blocco di push diretti e
force-push.

Le modifiche ad autenticazione, proxy, Content Security Policy, query streaming e dipendenze richiedono due proprietari reali nel file `.github/CODEOWNERS`. Il file `.github/CODEOWNERS.template` è soltanto un modello e non abilita review automatiche finché non viene copiato e completato.

## Convenzioni

- React 19 e TypeScript in modalità strict;
- componenti funzione e props tipizzate;
- import React/librerie prima degli import locali `@/*`;
- classi Tailwind e utility `cn()` per comporre gli stili;
- nessun cambiamento al protocollo streaming senza coordinamento con `unisearch-api`.

Non aggiungere una licenza senza una decisione esplicita dei titolari del progetto.
