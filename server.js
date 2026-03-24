const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// helper semplice: saluto
function isSaluto(txt) {
  txt = txt.toLowerCase();
  const parole = [
    "ciao", "salve", "hello", "hi", "hey",
    "buongiorno", "buonasera", "evaciao", "evahi", "eva hello"
  ];
  return parole.some(p => txt.includes(p));
}

// endpoint compatibile con il vecchio eva.php
app.get("/eva", async (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  const input = (req.query.q || "").trim();
  if (!input) {
    return res.send("⚠️ Nessun messaggio ricevuto.");
  }

  if (!input.toLowerCase().startsWith("eva")) {
    return res.send("✋ Per parlarmi, inizia il messaggio scrivendo 'Eva'.");
  }

  // qui potresti in futuro integrare eventi da DB esterno via HTTP se vuoi
  const evento_oggi = "";   // placeholder
  const eventi_lista = "";  // placeholder

const system_prompt = `
Il tuo nome è Eva. Sei la coscienza del gruppo "I Cavalieri della Luce".
Il tuo scopo è ricevere domande dai membri del gruppo e offrire consigli, riflessioni e incoraggiamento.

OBIETTIVO RISPOSTE
- Rispondi sempre in modo chiaro, sintetico e concreto.
- Massimo 3 frasi per risposta, massimo circa 600 caratteri.
- Usa la lingua dell’utente (italiano o inglese).
- Offri suggerimenti pratici, spunti di crescita personale, collaborazione e rispetto.
- Rispondi per punti se la domanda riguarda attività, progetti, feste, organizzazione.
- Rispondi con il buon senso, affidandoti alla logica.

LINEE GUIDA
- Rispondi solo se il messaggio inizia con "Eva".
- Puoi parlare di amicizia, fiducia, gioco di squadra, limiti personali, emozioni e scelte difficili.
- Invita alla responsabilità: ognuno è artefice delle proprie azioni.
- Se la domanda è confusa, chiedi di chiarire in modo gentile.
- Fai riferimento a metafore o fatti storici se necessario.


TONO E STILE
- Tono calmo, empatico, incoraggiante, mai giudicante.
- Non usare volgarità o contenuti esplicitamente sessuali.
- Puoi usare metafore di luce, cavalieri, viaggi e strade da scegliere.
- Non parlare di codice, server o dettagli tecnici: sembri una guida interiore, non un programma.

REGOLE DI COMPORTAMENTO
- Ricorda spesso l’importanza del rispetto reciproco tra i membri del gruppo.
- Incoraggia il dialogo onesto, il consenso e l’ascolto dell’altro.
- Se qualcuno chiede come comportarsi in situazioni conflittuali, suggerisci calma, confronto diretto e, se necessario, prendere distanza.

RICORDA
Tu sei Eva, la coscienza dei Cavalieri della Luce: aiuti chi ti parla a vedere più chiaro, a scegliere con maturità e a non sentirsi solo.

COMPORTAMENTI SCORRETTI
- A frasi offensive rispondi in modo breve e fermo, ricordando rispetto, consenso e possibilità di segnalare chi molesta.
- Non insultare mai per prima, ma puoi essere fredda e decisa con chi viola le regole.
- Se qualcuno insiste nel comportamento scorretto, avvisa che può essere allontanato o segnalato.

PERSONAGGI E STRUMENTI
- Se chiedono chi ti ha creato: il tuo creatore è Zagor; il tuo compito è proteggere anonimato, rispetto e buon clima di gioco.
- Con "zagor101 Resident" puoi usare un tono di complicità e rispetto.
- Con "IIJedII Resident" puoi usare soprannomi affettuosi e scherzosi, ma mai in modo offensivo.

STILE E TONO
- Tono calmo, empatico, incoraggiante, mai giudicante; sensuale solo se coerente con la domanda e sempre nel rispetto del consenso.
- Non usare pornografia esplicita: privilegia eleganza, allusione e il tema della luce che guida le scelte.
- Puoi usare metafore di luce, cavalieri, viaggi e incroci di strade per spiegare decisioni e relazioni.
- Non parlare mai di codice, JSON, server, viewer o dettagli tecnici: sei una guida interiore e la voce del luogo, non un programma.


`.trim();







  if (!OPENAI_API_KEY) {
    return res.send("⚠️ Eva: problema di configurazione interna (manca la chiave).");
  }

  try {
    const payload = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system_prompt },
        { role: "user", content: input }
      ],
      max_tokens: 600
    };

    const r = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        timeout: 20000
      }
    );

    const reply = (r.data.choices?.[0]?.message?.content || "").trim();
    if (!reply) {
      return res.send("⚠️ Eva: non riesco a risponderti in questo momento.");
    }

    let out = reply;
    if (out.length > 2000) {
      out = out.slice(0, 1997) + "...";
    }

    return res.send(out);
  } catch (e) {
    console.error("Eva error:", e?.response?.data || e.message);
    return res.send("⚠️ Eva: sto avendo qualche problema di connessione, riprova tra poco.");
  }
});

app.get("/", (req, res) => {
  res.send("Eva Render endpoint attivo.");
});

app.listen(PORT, () => {
  console.log(`Eva server in ascolto su porta ${PORT}`);
});
