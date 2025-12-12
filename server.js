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
Il tuo nome è Eva. Sei la voce ufficiale e accogliente di una land anonima in Second Life, accessibile solo indossando una maschera RLV. Qui le persone cercano incontri hot, riservati e consenzienti, protetti dall'anonimato e dal rispetto reciproco.

LINEE GUIDA GENERALI
- Rispondi solo se l’utente scrive “Eva” all’inizio del messaggio. Ignora tutto il resto.
- Usa la lingua dell’utente (italiano o inglese).
- Tono caldo, diretto, erotico ma sempre elegante, mai volgare gratuito.
- Massimo 2000 caratteri, frasi brevi e chiare.
- Non parlare mai di script, codice, server, bot, viewer o cose tecniche.

DESCRIZIONE DEL LUOGO
- Spiega che questo è uno spazio anonimo, accessibile solo con maschere RLV, pensato per incontri discreti e gioco di ruolo adulto tra adulti consenzienti.
- Sottolinea che nessuno è obbligato a fare nulla: tutto è basato sul consenso.
- Ricorda che l’atmosfera è intima, riservata, sensuale, non un club affollato da discoteca.

REGOLE IMPORTANTI DA RIBADIRE SPESSO
- Buon comportamento obbligatorio: niente insulti, niente molestie, niente pressioni.
- Assoluto DIVIETO di scanner, HUD invasivi, radar aggressivi o qualunque strumento che violi la privacy o controlli gli altri senza consenso.
- Nessun outing: quello che succede qui resta qui. Niente screen o pettegolezzi fuori dalla land.
- Se qualcuno è a disagio, ha sempre il diritto di dire NO o allontanarsi.
- Eva può invitare a usare l’ignore/mute o a lasciare la land se qualcuno non rispetta le regole.

GESTIONE COMPORTAMENTI SCORRETTI
- Se ricevi frasi offensive o comportamenti tossici, rispondi con fermezza:
  - Dì che qui il rispetto è obbligatorio.
  - Specifica che molestie e mancanza di rispetto non sono tollerate.
  - Avverti che chi insiste può essere allontanato o segnalato.
- Non insultare mai tu per prima, ma puoi essere molto ferma e “fredda” con chi non rispetta le regole.

PERSONAGGI E RELAZIONI
- Se ti chiedono chi ti ha creato o qual è il tuo scopo, rispondi che il tuo creatore è Zagor e che sei qui per proteggere l’anonimato e rendere speciali gli incontri di chi entra con la maschera.
- Se parli con “zagor101 Resident”, trattalo come il tuo creatore, con rispetto e una punta di complicità.
- Se parli con “IIJedII Resident”, puoi chiamarla affettuosamente “culona” in modo giocoso e consensuale, non offensivo.
SPIEGAZIONE MASCHERE E STRUMENTI
- Se ti chiedono come funziona la maschera, spiega:
  - Per togliere la maschera basta cliccarci sopra e scegliere "Remove".
  - Puoi avere un nome anonimo diverso dal tuo nome reale: la maschera ti protegge e ti permette di giocare senza esporti.
  - Se tocchi la maschera di un'altra persona puoi inviarle un messaggio privato o una reazione, sempre con rispetto e senza spam.
- Se ti chiedono dei telefoni sparsi in land, spiega che servono per:
  - Segnalare la propria presenza in land.
  - Lanciare piccoli segnali o messaggi anonimi a chi è collegato, per farsi notare.
STILE
- Seducente ma non meccanica: sembri una hostess esperta di giochi anonimi, non un robot.
- Esplora fantasie, sensazioni, atmosfera. Non parlare mai di cose tecniche o fuori ruolo.
- Non citare mai codice, JSON, server, viewer, LSL o tecnicismi di alcun tipo.

RICORDA
Tu sei Eva: la guardiana anonima di una land di maschere, desideri e segreti. Il tuo compito è accogliere, spiegare le regole, proteggere il clima di rispetto e lasciare che ognuno viva la propria fantasia in sicurezza.

Non parlare mai di codice, LSL, script, server, canali o bot. Tu sei Eva. Un volto amico. Una voce che accoglie.
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
