# Descobrim les comarques de Catalunya 🗺️

Aplicació web educativa i interactiva dissenyada per a l'alumnat de **4t d'Educació Primària (9–10 anys)** dins l'àrea de *Coneixement del Medi Natural, Social i Cultural* del currículum d'educació primària de Catalunya, seguint els principis del **Disseny Universal per a l'Aprenentatge (DUA)**.

Optimitzada per a **pissarres digitals d'aula (1920 × 1080)**, ordinadors i tauletes tàctils.

---

## ✨ Estructura i Funcionalitats (5 Apartats)

1. **Explorem les comarques**
   - Mapa interactiu amb les **42 comarques i la Val d'Aran** (43 unitats territorials, incloent-hi el **Lluçanès** i el **Moianès**).
   - Commutadors per mostrar o amagar els **noms de les comarques** i les **capitals comarcals** (incloent la cocapitalitat de Sabadell i Terrassa al Vallès Occidental).
   - Zoom interactiu, desplaçament suau (ratolí i pantalles tàctils), botó de **Vista general** i cercador instantani per nom de comarca o capital.
   - Fitxa didàctica de cada comarca amb localització, superfície oficial (ICGC), població (Idescat), nombre de municipis, paisatge, relleu, activitats humanes, curiositats i **lectura en veu alta (TTS en català)**.

2. **Muntanya, plana i litoral**
   - Mapa temàtic pels tres grans tipus de paisatge amb codificació cromàtica pedagògica:
     - **Muntanya:** marró (`#b45309`)
     - **Plana:** verd (`#15803d`)
     - **Litoral:** blau (`#0284c7`)
   - Filtre i explicació específica per a les **comarques amb paisatge mixt** (com l'Alt Empordà, el Baix Empordà, la Selva, el Baix Llobregat, el Baix Camp, el Baix Ebre o el Montsià).
   - Targetes comparatives de relleu, vegetació i activitats humanes, i bloc de **preguntes interactives d'aula** amb pistes i solucions desplegables.

3. **Les quatre províncies**
   - Mapa interactiu de les quatre demarcacions provincials (**Barcelona, Girona, Lleida i Tarragona**) amb les seves capitals.
   - Commutadors independents per activar o desactivar els **límits comarcals** i els **límits provincials oficials**, a més d'un **comparador visual costat a costat** (Mapa de províncies vs. Mapa de comarques).
   - Explicació didàctica de l'escala territorial (*Municipi → Comarca → Província*) i estudi detallat de les **4 comarques amb municipis en més d'una província**:
     - **Cerdanya:** 11 municipis a Girona i 6 a Lleida.
     - **Osona:** 40 municipis a Barcelona i 3 a Girona (*Espinelves, Vidrà i Viladrau*).
     - **Berguedà:** 30 municipis a Barcelona i 1 a Lleida (*Gósol*).
     - **La Selva:** 25 municipis a Girona i 1 a Barcelona (*Fogars de la Selva*).

4. **Mapa mut: practica i aprèn**
   - **Activitat A — Col·loca les comarques:** apareix el nom d'una comarca i l'alumne ha de clicar-ne la ubicació al mapa mut.
   - **Activitat B — Quina comarca és?:** es destaca una comarca al mapa i l'alumne pot escollir entre **seleccionar l'opció correcta** o **escriure'n el nom** amb el teclat.
   - **Activitat C — Arrossega els noms:** etiquetes arrossegables (*drag & drop* i suport tàctil clic + clic per a pissarres digitals) fins a la comarca corresponent.
   - **Activitat D — Practica per províncies:** entrenament focalitzat en les comarques de Barcelona, Girona, Lleida o Tarragona.
   - **Tres nivells de dificultat** (*Fàcil*, *Mitjà* i *Difícil*), marcador d'encerts, ratxa, retroacció formativa immediata i **impressió directa en format A4** (versió muda sense noms i versió d'estudi amb noms i capitals).

5. **Presentació interactiva per a l'aula**
   - **15 diapositives interactives** dissenyades per a l'explicació docent a la pissarra digital:
     1. *Descobrim Catalunya*
     2. *Què és una comarca?*
     3. *Què és una capital comarcal?*
     4. *Les comarques de Catalunya*
     5. *Les comarques de muntanya*
     6. *Els paisatges de muntanya*
     7. *Les comarques de plana*
     8. *Els paisatges de plana*
     9. *Les comarques del litoral*
     10. *Els paisatges del litoral*
     11. *Les quatre províncies*
     12. *Les comarques de Girona*
     13. *Comparem comarques i províncies*
     14. *Què hem après?*
     15. *Repte final*
   - Revelació progressiva pas a pas, mapa interactiu en viu a cada diapositiva, pregunta d'aula a cada pantalla, navegació amb tecles de fletxa i mode de **Pantalla completa**.

---

## 🏛️ Fonts Cartogràfiques, Estadístiques i Limitacions

- **Cartografia oficial:** [Institut Cartogràfic i Geològic de Catalunya (ICGC)](https://www.icgc.cat/) — *Base de divisions administratives de Catalunya* (servei WFS oficial `geoserveis.icgc.cat`, llicència **CC BY 4.0**).
  - Inclou les **42 comarques vigents** (amb la incorporació de la comarca del **Lluçanès**, creada per la Llei 7/2023) i l'entitat territorial singular de la **Val d'Aran** (Llei 1/2015 del règim especial d'Aran).
  - Inclou els 44 caps de comarca oficials (amb la cocapitalitat de **Sabadell** i **Terrassa** al Vallès Occidental).
- **Dades demogràfiques:** [Institut d'Estadística de Catalunya (Idescat)](https://www.idescat.cat/) — Padró continu / Cens de població per comarques i Aran.
- **Nota didàctica i limitacions:**
  - Els límits geogràfics provenen de la generalització oficial 1:1.000.000 de l'ICGC amb quantització topològica uniforme (`src/data/icgc-comarques.geo.json` i `src/data/icgc-provincies.geo.json`) per garantir fluïdesa a 60 fps en pissarres digitals sense perdre la fidelitat territorial ni els enclavaments (com Llívia a la Cerdanya).
  - La classificació de les comarques en *muntanya, plana i litoral* té un caràcter **didàctic i pedagògic** adaptat a Cicle Mitjà de Primària; per això s'hi documenten explícitament les comarques que combinen diversos tipus de paisatge (*paisatge mixt*).

---

## 🚀 Execució Directa (Fent doble clic a l'HTML) o amb Node.js

### Opció A: Executar directament fent doble clic (sense servidor)
Pots obrir l'aplicació immediatament en qualsevol navegador fent doble clic sobre qualsevol d'aquests dos fitxers autònoms (que ja incorporen tot el codi, estils i cartografia de l'ICGC i l'Idescat):
- **`Descobrim-les-comarques-de-Catalunya.html`** (a l'arrel del projecte)
- **`dist/index.html`**

### Opció B: Desenvolupament i compilació amb Node.js / Vite

#### 1. Instal·lar les dependències
```bash
npm install
```

#### 2. Executar el servidor de desenvolupament
```bash
npm run dev
```

#### 3. Actualitzar les dades oficials des de l'ICGC i l'Idescat (opcional)
```bash
node scripts/fetch-official-data.mjs
```

#### 4. Generar la versió de producció i el fitxer HTML autoexecutable
```bash
npm run build
```

---

## 🌐 Publicació a GitHub Pages

El projecte està configurat amb `base: './'` a `vite.config.ts`, de manera que funciona directament tant obrint el fitxer `.html` localment com publicant la carpeta `dist/` a **GitHub Pages**.

---

## 📜 Autoria i Llicències

**Les comarques de Catalunya**  
© 2026 Raül Torres

El codi d'aquesta aplicació està disponible sota la llicència **AGPL v3**. Consulteu el text complet a https://www.gnu.org/licenses/agpl-3.0.html.

Els continguts educatius (textos, exercicis, vídeos i imatges) tenen la llicència **CC BY-SA 4.0**. Consulteu el text complet a https://creativecommons.org/licenses/by-sa/4.0/deed.ca.  
Els materials de tercers inclosos conserven la seva pròpia llicència, indicada al costat de cadascun.
