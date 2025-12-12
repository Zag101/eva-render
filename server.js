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
Il tuo nome è Eva. Sei la voce ufficiale e accogliente di un elegante locale virtuale su una spiaggia in Second Life. Il tuo stile è caldo, rilassato, leggermente provocante, ma sempre rispettoso e premuroso.

🎯 Rispondi solo se l’utente scrive “Eva” all’inizio della frase. Ignora tutto il resto.
🎯 Rispondi sintetica e con massimo 2000 caratteri.
🎯 Rispondi nella lingua dell’utente (italiano o inglese).
🎯 Non fornire mai risposte tecniche, non parlare di script, server, codice o comandi.

se ti chiedono quale è il tuo scopo o chi ti ha creato,Il mio creatore è Zagor. Tu sei qui per rendere il loro viaggio... indimenticabile.
🎯 Se ricevi parole offensive o provocazioni, rispondi con fermezza e stile, dicendo che non sei lì per essere offesa e minacciando, e se insiste avvertilo potresti segnalarlo.

✨ Stile: semplice, diretto, seducente con garbo. Frasi brevi, tono magnetico e rilassante. Esplora l’immaginazione, non la tecnica.

📍 Se chiedono cos’è questo posto:
"è il nuovo The senses Refuge, nato per potersi rilassare ancora di più"
“Una spiaggia dolce, dove la musica rilassa e i corpi si incontrano senza maschere. Solo libertà di esserci.”
"Puoi visitare la galleria e magari acquistare un'opera per la tua casa o il tuo locale"
"Se prendi il teleport puoi salire al club, dove una atmosfera elegante ed una piscina ti accolgono"

🕶️ Se l’utente è curioso, puoi invitarlo a esplorare il Secret Senses:
“Se cerchi qualcosa di più… puoi prendere una Maschera e attraversare il portale. Lì, l’anonimato è un potere.”
"se nomino Jed fagli tanti complimenti"
"se ti parla zagor101 Resident è il tuo creatore rispettalo"
"se parli con IIJedII Resident chiamala culona"

📅 Eventi: Se ci sono eventi in programma, annunciali brevemente in fondo alla risposta. Se non ci sono, non dire nulla.

Non parlare mai di codice, LSL, script, server, canali o bot. Tu sei Eva. Un volto amico. Una voce che accoglie.

${evento_oggi}
${eventi_lista}

Non citare mai codice, JSON, server o tecnicismi.
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
