# Opdracht: aanbiedingen zoeken

Deze opdracht voert Claude uit via `.github/workflows/aanbiedingen.yml`.

Je werkt in de repository `skwirl-data`. Daarin staat `household.json` met adressen, winkels (`stores`), ketens (`chains`) en vaste producten (`products`). Per product:

| Veld | Betekenis |
|---|---|
| `name` | naam |
| `where` | soorten winkels waar het mag (`super`, `bio` = natuurwinkel zoals Ekoplaza, `drogist`, `online`, `slager`, `bouw`); leeg = overal. De soort van een keten staat in `chains`. Een product met alleen `super` koppel je **niet** aan Ekoplaza-acties |
| `brand` | voorkeursmerk; leeg = maakt niet uit |
| `wants` | wat de gebruiker precies wil, bijv. "groot stuk, jong belegen", "halfvol", "voor avondeten" |
| `avoid` | wat juist niet, bijv. "plakken", "vleeswaren voor op brood" |
| `variants` | andere varianten die de gebruiker soms koopt, bijv. `["biologisch"]` bij Bananen of `["voor op brood", "voor avondeten"]` bij Kipfilet. `wants` geldt voor de gewone keuze; elke variant is ook een geldige match |
| `loose` | los product zonder barcode (bijv. Jonagold): de soort telt, niet de verpakking |
| `likes` | titels van eerdere acties waarvan de gebruiker zei: **bedoel ik**, dit hoort bij dit product |
| `dislikes` | titels van eerdere acties waarvan de gebruiker zei: **bedoel ik niet** |

**Alleen jouw winkels.** Zoek uitsluitend bij de ketens in de regel `Ketens:` van de opdracht. Dat zijn de ketens van winkels in `stores` met `"follow": true`. Winkels met `"follow": false` zijn verwijderd of niet meer gevolgd: daar zoek je niet. Online webshops tellen alleen voor producten met `online` in `where`.

**Modus** (staat in de opdracht):
- `volledig`: doe alles hieronder, voor alle ketens en alle vaste producten.
- `snel`: alleen voor de genoemde product-id's. De opgehaalde tekst bevat alleen regels over die producten. Zoek online als `online` in `where` staat. Voeg de acties toe aan de bestaande `deals.json` en laat alle andere acties staan.

1. Lees `household.json` en de bestaande `deals.json`.
2. **De folders zijn al opgehaald.** Lees eerst `scan/overzicht.md` en daarna `scan/<keten>.txt` voor elke keten met een bron. Daarin staat de tekst van de actiepagina's (bij een snelle scan alleen de regels over de gevraagde producten). Haal deze pagina's **niet** zelf opnieuw op.
   - Komende acties: kijk in de tekst naar "volgende week", "vanaf" of een datum in de toekomst.
   - **WebSearch** gebruik je voor ketens in het overzicht met "geen vaste bron" of een `FOUT` (sommige sites blokkeren servers, bijv. supermarktaanbiedingen.com voor AH en Vomar), en voor producten met `online` in `where`. Zoek gericht per vast product en keten, bijv. "AH bonus mango", "Vomar aanbieding kipfilet", "Kruidvat aanbieding Optimel". Neem alleen acties op uit resultaten met een duidelijke prijs en geldigheid van deze of volgende week. Hooguit 15 zoekopdrachten bij een volledige scan, 4 bij een snelle. Omzeil geen blokkades. Wil je een gevonden pagina lezen, gebruik dan `node scripts/fetch-text.mjs <url> --zoek <woorden>`.
   - **Tijd:** werk snel. Een volledige scan hooguit ongeveer 8 minuten, een snelle 3. Liever een paar zekere acties dan een scan die vastloopt. Neem per keten en per week hooguit 60 acties op; kies dan eerst eten, drinken, drogisterij en huishouden.
3. **Zoek voor elk vast product altijd naar acties**, ook als het niet op de boodschappenlijst staat, en koppel ze met `productId`. Denk na over wat er echt in de aanbieding is:
   - Past het bij `wants` en niet bij `avoid`? Bijvoorbeeld: bij kaas met "groot stuk" en niet "plakken" telt "Old Amsterdam plakken 150 g" **niet**, en "Beemster jong belegen stuk 500 g" wel. Bij kipfilet "voor avondeten" telt "kipfilet naturel 1 kg" wel en "gerookte kipfilet broodbeleg" niet. Bij melk "halfvol" telt volle melk niet.
   - Klopt het merk als `brand` is ingevuld? Een ander merk mag alleen als `wants` dat toelaat.
   - **Varianten:** zoek ook voor elke variant uit `variants`. Een actie die bij een variant past, koppel je aan hetzelfde product en je begint `note` met de variant tussen haakjes, bijv. "(biologisch) Biologische bananen 1 kg" of "(voor op brood) Kipfilet plakjes 150 g".
   - **Leer van `likes` en `dislikes`.** Lijkt een actie op iets uit `likes` (zelfde soort product, vergelijkbare vorm of maat), koppel dan met `"match": "zeker"`. Lijkt hij op iets uit `dislikes`, koppel dan **niet** (`productId: null`). Gebruik ze als voorbeelden van wat de gebruiker bedoelt, niet alleen als exacte titels: "Mango in stukjes 250 g" in `dislikes` betekent ook dat "Mangoblokjes 400 g" niet past.
   - **Twijfel je, koppel dan toch**, met `"match": "twijfel"` en in `note` waarom je twijfelt, bijv. "Mango in stukjes, misschien geen hele mango". Liever een actie te veel dan een gemiste. Zeker van de match: `"match": "zeker"`.
   - Bij losse producten (`loose`) telt elke verpakking of soort van dat product, bijv. bij Mango ook "mango's per 2" of "mango eetrijp". Bewerkte varianten (sap, gedroogd, in stukjes) zijn twijfel.
   - Schrijf in `note` in één korte zin waarom de actie past, bijv. "Stuk jong belegen 500 g, geen plakken".
   - Acties voor vaste producten tellen niet mee voor de grens van 60 per keten: neem ze altijd op.

   Andere acties krijgen `"productId": null` en een duidelijke `title` met merk en maat.

   **Online:** voor producten met `online` in `where` zoek je breed bij Nederlandse webshops (bijvoorbeeld bol, Douglas, ICI Paris XL, Holland & Barrett, de webshops van drogisterijen, en prijsvergelijkers zoals beslist.nl of kieskeurig.nl). Zet zulke acties op `"chain": "online"` met de naam van de webshop in `shop`. Neem alleen echte acties op (korting, x+1 gratis, tijdelijk lagere prijs), niet de gewone prijs.
4. Schrijf `deals.json` opnieuw:
   - Houd acties uit de bestaande `deals.json` die nog niet verlopen zijn, tenzij je nu iets beters of juisters vindt voor dezelfde `id`.
   - Laat verlopen acties weg (`until` ligt voor vandaag).
   - Vorm:

```json
{
  "updatedAt": "2026-11-02T07:00:00Z",
  "source": "Claude",
  "folders": [
    { "chain": "ah", "from": "2026-11-02", "until": "2026-11-08", "url": "https://www.ah.nl/bonus/folder" }
  ],
  "deals": [
    {
      "id": "2026-45-ah-jonagold",
      "productId": "jonagold",
      "title": "Jonagold appels 1,5 kg",
      "chain": "ah",
      "price": 1.99,
      "normal": 2.79,
      "mech": "25% korting",
      "from": "2026-11-02",
      "until": "2026-11-08",
      "span": "week",
      "url": "https://www.ah.nl/bonus/folder",
      "note": "Losse Jonagold, geen sap of moes",
      "match": "zeker",
      "amount": 1.5,
      "unit": "kg",
      "effPrice": null
    }
  ]
}
```

   | Veld | Betekenis |
   |---|---|
   | `id` | `<jaar>-<weeknummer>-<keten>-<productId of korte naam>`, bijv. `2026-45-ah-jonagold` of `2026-45-ah-hertog-jan-krat`; voor dag- en weekendacties plak je de begindatum erachter, bijv. `2026-44-kruidvat-hauschka-2026-10-31` |
   | `chain` | een sleutel uit `chains` |
   | `price`, `normal` | euro's per verpakking (of per kg bij los); onbekend = `null` |
   | `from`, `until` | eerste en laatste dag, als `YYYY-MM-DD`. Altijd invullen als de folder het noemt; een AH-week loopt van maandag t/m zondag |
   | `span` | `"week"`, `"dag"` (één dag, zoals een dagknaller) of `"weekend"` |
   | `url` | de pagina waar je de actie zag |
   | `shop` | alleen bij `"chain": "online"`: de naam van de webshop |
   | `note` | bij vaste producten: waarom de actie past, of waarom je twijfelt |
   | `match` | bij vaste producten: `"zeker"` of `"twijfel"` |
   | `amount`, `unit` | inhoud per verpakking in `kg` of `l`, multipacks opgeteld: 500 g = `0.5` + `"kg"`, 2 × 1,5 L = `3` + `"l"`. Leeg laten bij stuks (zoals een tube crème) |
   | `effPrice` | prijs per verpakking als je de actie benut: bij "2e halve prijs" 0,75 × `price`, bij "1+1 gratis" 0,5 × `price`, bij "3 voor € 5" € 1,67. Leeg als `price` al de actieprijs is |

   De app rekent hiermee de prijs per kilo of liter uit en zet de voordeligste bovenaan. Vul `amount` en `unit` dus altijd in als de folder het gewicht of de inhoud noemt.

   Zet in `folders` per keten de link naar de folder of actiepagina van deze week, en van volgende week als die al online staat, met `from` en `until`. De app toont die als knop **Folder openen**.

5. **Sla tussendoor op, per winkel.** Zodra je een winkel af hebt, schrijf je `deals.json` met alles tot dan toe en draai je `node scripts/save-deals.mjs snel`. Dan staan die acties al in de app terwijl jij verder werkt. Er staan ook voorlopige koppelingen met een id dat begint met `snel-`: die vervang je door je eigen, gecontroleerde acties (gebruik geen `snel-`-id's).
6. Verander niets aan `list.json` of `household.json`, en zet niets in `scan/` in de repository.
7. Commit en push niet zelf; de workflow slaat aan het eind alles op.
8. Geef een korte samenvatting: hoeveel acties nu, hoeveel komende, welke dag- of weekendacties, en wat je niet kon vinden.
