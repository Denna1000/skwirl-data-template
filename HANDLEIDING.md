# Skwirl voor je eigen huishouden

Skwirl is een gedeeld boodschappenlijstje (net als Bring) dat ook bijhoudt wanneer jouw vaste producten in de aanbieding zijn. Jij krijgt je **eigen** lijst en gegevens. Niemand anders kan erbij.

Reken op ongeveer **30 minuten** voor stap A t/m F. Stap G en H (aanbiedingen) mag je later doen.

> Je hebt nodig: een telefoon, een computer (Mac is handig), en je e-mailadres.

---

## A. Maak een GitHub-account (5 min)

GitHub is de plek waar jouw gegevens veilig en privé worden bewaard. Het is gratis.

1. Ga op je computer naar **github.com** en klik op **Sign up**.
2. Vul je e-mailadres in, kies een wachtwoord en een gebruikersnaam (bijv. `annasmit`). **Onthoud je gebruikersnaam.**
3. Bevestig je e-mail met de code die je krijgt.

---

## B. Maak je eigen gegevensmap (2 min)

1. Ga naar **github.com/Denna1000/skwirl-data-template**.
2. Klik rechtsboven op de groene knop **Use this template** → **Create a new repository**.
3. Vul in:
   - **Repository name:** `skwirl-data`
   - Kies **Private** (heel belangrijk: dan kan alleen jij erbij)
4. Klik op **Create repository**.

Klaar: je hebt nu een lege, privé gegevensmap.

---

## C. Maak een sleutel voor de app (5 min)

Met deze sleutel mag de app in jouw gegevensmap lezen en schrijven, en nergens anders.

1. Klik op github.com rechtsboven op je **profielfoto** → **Settings**.
2. Scrol links helemaal naar beneden → **Developer settings**.
3. Klik **Personal access tokens** → **Fine-grained tokens** → **Generate new token**.
4. Vul in:
   - **Token name:** `Skwirl app`
   - **Expiration:** kies **Custom** en een datum over een jaar (zet een herinnering in je agenda)
   - **Repository access:** **Only select repositories** → kies **skwirl-data**
   - **Permissions** → **Repository permissions** → zoek **Contents** → zet op **Read and write**
5. Klik onderaan op **Generate token**.
6. **Kopieer de sleutel meteen** (begint met `github_pat_`) en bewaar hem in je wachtwoordmanager of in Wachtwoorden op je iPhone. Je ziet hem maar één keer.

---

## D. Zet de app op je telefoon (3 min)

1. Open op je telefoon **Safari** en ga naar **denna1000.github.io/skwirl**
2. Vul in:
   - **Je naam:** je voornaam
   - **GitHub-gebruikersnaam:** je gebruikersnaam uit stap A
   - **Repository met gegevens:** `skwirl-data` (staat er al)
   - **Sleutel:** plak de sleutel uit stap C
3. Tik op **Verbinden**.
4. Zet hem op je beginscherm: tik onderin op **Deel** (vierkantje met pijl, of eerst op •••) → **Zet op beginscherm** → **Voeg toe**.

Vanaf nu open je Skwirl met het eikeltje op je beginscherm.

---

## E. Richt je app in (10 min)

Tik rechtsboven op het **kaartje** (Plekken):

1. **Adres toevoegen:** bijv. "Thuis". Typ straat, huisnummer en plaats, tik **Zoeken**, kies het goede adres, **Toevoegen**. Doe hetzelfde voor werk of familie als je wilt.
2. **Winkel toevoegen:** kies de keten (bijv. Albert Heijn), zoek het adres van jouw vestiging, **Toevoegen**. Doe dit voor elke winkel waar je komt. Winkels die je niet gebruikt, haal je weg met het **×**.

Tik onderin op **Producten** → **Product toevoegen**, voor alles wat je steeds opnieuw koopt:

- **Naam:** bijv. `Volle yoghurt`
- **Merk:** leeg laten als het niet uitmaakt
- **Wat wil je precies?** bijv. `1 liter of meer`
- **Varianten die je soms koopt:** bijv. bij Bananen `biologisch`
- **Wat juist niet?** bijv. `plakken`
- **Te koop bij:** vink aan waar je het koopt (supermarkt, drogist, online…)

---

## F. Je partner erbij (2 min)

1. Tik in Skwirl op het **kaartje** → scrol naar **Samen gebruiken** → **Telefoon koppelen** → **Delen**.
2. Stuur de link via AirDrop of WhatsApp.
3. Je partner opent hem **in Safari**, vult alleen zijn of haar naam in, tikt **Verbinden** en zet de app op het beginscherm (zoals stap D4).
4. Verwijder daarna het bericht met de link (de sleutel zit erin).

Je partner heeft **geen** GitHub-account nodig.

**Het boodschappenlijstje werkt nu al.** De stappen hieronder zijn voor de aanbiedingen.

---

## G. Aanbiedingen laten zoeken (15 min, op de computer)

Claude (een AI) zoekt drie keer per week en op verzoek naar acties voor jouw vaste producten. Daarvoor heb je een **Claude-abonnement** nodig.

> Gebruik je hiervoor een Claude-account van je werk? Vraag dan eerst of dat mag voor privégebruik.

1. **Claude Code installeren.** Open **Terminal** (⌘ + spatie, typ `Terminal`, Enter) en plak:

   ```bash
   curl -fsSL https://claude.ai/install.sh | bash
   ```

   Sluit Terminal (⌘ + Q) en open hem opnieuw.

2. **Sleutel voor Claude maken.** Plak in Terminal:

   ```bash
   ~/.local/bin/claude setup-token
   ```

   Je browser opent: log in met je Claude-account en klik **Authorize**. In Terminal verschijnt een lange sleutel die begint met `sk-ant-oat`. Kopieer die.

3. **Sleutel in GitHub zetten.** Ga naar **github.com/JOUW-GEBRUIKERSNAAM/skwirl-data** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
   - **Name:** `CLAUDE_CODE_OAUTH_TOKEN`
   - **Secret:** plak de sleutel → **Add secret**

4. **Claude toegang geven.** Ga naar **github.com/apps/claude** → **Install** → **Only select repositories** → **skwirl-data** → **Install**.

5. **Testen.** In je repository: **Actions** → links **Aanbiedingen** → **Run workflow** → groene knop **Run workflow**. Na 5 à 10 minuten zie je een groen vinkje en staan de acties in de app onder **Vandaag**.

Rood kruisje? Klik erop, dan **scan**, en kijk bij de stap met het kruisje wat er staat.

---

## H. Je Mac als bron voor Albert Heijn en Vomar (10 min, optioneel)

De folders van AH en Vomar komen van een site die de servers van GitHub weigert. Je Mac kan ze wel ophalen, zoals een gewone bezoeker: op werkdagen het eerste moment na 9:30 dat je Mac aanstaat, en als je in de app op **Nu zoeken** tikt.

1. **Je gegevensmap op je Mac zetten.** Installeer **GitHub Desktop** (desktop.github.com) en log in. Kies **File → Clone Repository**, kies **skwirl-data**, en zet hem in je thuismap (bij *Local path* staat dan iets als `/Users/jouwnaam/skwirl-data`). Klik **Clone**.
2. **Sleutel in de sleutelhanger van je Mac.** Open Terminal en plak:

   ```bash
   security add-generic-password -a skwirl -s skwirl-github -T /usr/bin/security -w
   ```

   Plak bij beide vragen de sleutel uit stap C (je ziet niets tijdens het plakken, dat is normaal).
3. **Node.js installeren** als je dat nog niet hebt: **nodejs.org** → download de **LTS**-versie → installeren.
4. **De taak aanzetten.** Plak in Terminal:

   ```bash
   sh ~/skwirl-data/scripts/mac-installeer.sh
   ```

5. **Testen:**

   ```bash
   node ~/skwirl-data/scripts/mac-bron.mjs
   ```

   Je ziet per winkel het aantal regels en dan **Verstuurd**. Een paar minuten later staan de acties in de app.

Stoppen kan altijd met `sh ~/skwirl-data/scripts/mac-installeer.sh --stop`.

---

## Handig om te weten

- **De app wordt vanzelf bijgewerkt** als er een nieuwe versie is.
- **Telefoon kwijt?** Ga naar GitHub → Settings → Developer settings → Fine-grained tokens, verwijder de sleutel en maak een nieuwe (stap C). Koppel daarna opnieuw (stap D en F).
- **Kosten:** GitHub is gratis. De aanbiedingen gebruiken je Claude-abonnement.
- **Privacy:** je adressen en lijstjes staan alleen in jouw privé `skwirl-data`. Houd die altijd op **Private**.
