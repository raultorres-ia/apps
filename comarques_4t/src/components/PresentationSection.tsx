import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  COMARQUES_DATA,
  PROVINCIES_DATA,
  ComarcaFeature,
} from '../utils/cartography';
import { PAISATGE_META, PROVINCIES_INFO } from '../data/comarquesInfo';
import { CataloniaMap } from './CataloniaMap';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Home,
  Sparkles,
  CheckCircle2,
  Eye,
  Trophy,
  RotateCcw,
} from 'lucide-react';

interface PresentationSectionProps {
  onBackToMenu: () => void;
}

interface SlideDefinition {
  num: number;
  emoji: string;
  title: string;
  subtitle: string;
  badge: string;
  steps: {
    heading: string;
    body: string;
    highlightComarques?: string[];
    focusProvinciaCodi?: string;
  }[];
  question: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  mapMode:
    | 'all-pastel'
    | 'comarca-concept'
    | 'capitals'
    | 'all-43'
    | 'muntanya-map'
    | 'muntanya-detail'
    | 'plana-map'
    | 'plana-detail'
    | 'litoral-map'
    | 'litoral-detail'
    | 'provincies'
    | 'girona-prov'
    | 'compare-com-prov'
    | 'summary'
    | 'final-challenge';
}

const SLIDES: SlideDefinition[] = [
  {
    num: 1,
    emoji: '🐉',
    title: 'Descobrim Catalunya',
    subtitle: 'Un viatge súper divertit pel nostre territori, els seus paisatges i la seva gent!',
    badge: 'Diapositiva 1 · Benvinguts exploradors!',
    mapMode: 'all-pastel',
    steps: [
      {
        heading: '🧭 On és Catalunya?',
        body: 'Al nord-est de la península Ibèrica, banyada pel mar Mediterrani a l’est i amb les grans muntanyes dels Pirineus al nord.',
      },
      {
        heading: '🤝 Amb qui fem frontera?',
        body: 'Al nord amb França i Andorra, a l’oest amb l’Aragó, al sud amb el País Valencià i a l’est amb el mar Mediterrani.',
      },
      {
        heading: '🌈 Un territori ple de paisatges!',
        body: 'En pocs quilòmetres tenim cims nevats de més de 3.000 m, grans planes verdes i platges assolellades.',
      },
    ],
    question: {
      prompt: '🌊 Quin mar banya tota la costa est de Catalunya?',
      options: ['L’oceà Atlàntic', 'El mar Mediterrani', 'El mar Cantàbric'],
      correctIndex: 1,
      explanation: 'Súper bé! El mar Mediterrani banya tota la nostra costa des de l’Alt Empordà fins al Montsià.',
    },
  },
  {
    num: 2,
    emoji: '🧩',
    title: 'Què és una comarca?',
    subtitle: 'Un equip de pobles i ciutats veïns que comparteixen paisatge i serveis!',
    badge: 'Diapositiva 2 · L’equip comarcal',
    mapMode: 'comarca-concept',
    steps: [
      {
        heading: '🏘️ Més gran que un poble o municipi',
        body: 'A Catalunya hi ha 947 municipis (pobles i ciutats). Els municipis veïns s’ajunten per formar una comarca.',
      },
      {
        heading: '🏞️ Un mateix paisatge natural',
        body: 'Sovint una comarca és una mateixa vall (com la Cerdanya o l’Aran), una plana (com Osona o el Bages) o una franja de costa (com el Maresme).',
        highlightComarques: ['15', '24', '07', '21'],
      },
      {
        heading: '🏥 Per a què serveix?',
        body: 'Perquè tots els pobles de la zona puguin compartir hospital, instituts, autobusos, mercats i cuidar la natura junts!',
      },
    ],
    question: {
      prompt: '🤔 Què tenen en comú els pobles d’una mateixa comarca?',
      options: [
        'Tenen exactament el mateix nombre de cases',
        'Són veïns i comparteixen paisatge, serveis i una capital comarcal',
        'Tots tenen platja i pistes d’esquí',
      ],
      correctIndex: 1,
      explanation: 'Molt bé! Una comarca agrupa pobles veïns que es relacionen i comparteixen serveis.',
    },
  },
  {
    num: 3,
    emoji: '📍',
    title: 'Què és una capital comarcal?',
    subtitle: 'La ciutat o vila que fa de punt de trobada de tota la comarca!',
    badge: 'Diapositiva 3 · Les capitals',
    mapMode: 'capitals',
    steps: [
      {
        heading: '🌟 El cor de la comarca',
        body: 'Cada comarca té una població principal, la capital comarcal, on hi ha el Consell Comarcal, l’hospital, mercats i serveis.',
      },
      {
        heading: '🏙️ Exemples de capitals',
        body: 'Manresa és la capital del Bages, Figueres la de l’Alt Empordà, Valls la de l’Alt Camp i Tremp la del Pallars Jussà.',
        highlightComarques: ['07', '02', '01', '25'],
      },
      {
        heading: '👯 Un cas únic: dues capitals alhora!',
        body: 'El Vallès Occidental és l’única comarca amb dues capitals compartides: Sabadell i Terrassa!',
        highlightComarques: ['40'],
      },
    ],
    question: {
      prompt: '👯 Quina comarca de Catalunya té dues capitals (Sabadell i Terrassa)?',
      options: ['El Vallès Oriental', 'El Vallès Occidental', 'El Baix Llobregat'],
      correctIndex: 1,
      explanation: 'Exacte! Sabadell i Terrassa comparteixen la capitalitat del Vallès Occidental.',
    },
  },
  {
    num: 4,
    emoji: '🗺️',
    title: 'Les comarques de Catalunya',
    subtitle: '42 comarques + la Val d’Aran (amb la nova comarca del Lluçanès!)',
    badge: 'Diapositiva 4 · Les 43 peces del mapa',
    mapMode: 'all-43',
    steps: [
      {
        heading: '🔢 42 comarques i l’Aran',
        body: 'El mapa oficial de Catalunya té 42 comarques i la Val d’Aran (43 territoris en total).',
      },
      {
        heading: '✨ El Lluçanès (2023) i el Moianès (2015)',
        body: 'Les dues comarques més joves són el Moianès (capital: Moià) i el Lluçanès (capital: Prats de Lluçanès, nascuda el 2023!).',
        highlightComarques: ['42', '43'],
      },
      {
        heading: '🏔️ La Val d’Aran: un territori singular',
        body: 'L’Aran (capital: Vielha) té govern propi (Conselh Generau d’Aran) i llengua pròpia oficial: l’aranès!',
        highlightComarques: ['39'],
      },
    ],
    question: {
      prompt: '✨ Quina és la comarca més jove de Catalunya, amb capital a Prats de Lluçanès?',
      options: ['El Moianès', 'El Lluçanès', 'La Garrotxa'],
      correctIndex: 1,
      explanation: 'Genial! El Lluçanès es va crear l’any 2023 amb 8 municipis i capital a Prats de Lluçanès.',
    },
  },
  {
    num: 5,
    emoji: '🏔️',
    title: 'Les comarques de muntanya',
    subtitle: 'El Pirineu, el Prepirineu i les terres més altes (color marró)',
    badge: 'Diapositiva 5 · Muntanya (I)',
    mapMode: 'muntanya-map',
    steps: [
      {
        heading: '🦅 On són les muntanyes més altes?',
        body: 'Sobretot al nord de Catalunya, als Pirineus i al Prepirineu, i també al Priorat i la Terra Alta al sud.',
        highlightComarques: ['39', '05', '26', '25', '04', '15', '31', '14', '35', '19', '29', '37'],
      },
      {
        heading: '❄️ L’Alt Pirineu i Aran',
        body: 'La Val d’Aran, l’Alta Ribagorça, el Pallars Sobirà, el Pallars Jussà, l’Alt Urgell i la Cerdanya.',
        highlightComarques: ['39', '05', '26', '25', '04', '15'],
      },
      {
        heading: '🌋 Volcans, cingles i serralades',
        body: 'El Ripollès, la Garrotxa (amb més de 40 volcans!), el Berguedà, el Solsonès, el Priorat i la Terra Alta.',
        highlightComarques: ['31', '19', '14', '35', '29', '37'],
      },
    ],
    question: {
      prompt: '⛰️ A quina comarca pirinenca hi ha la Pica d’Estats (3.143 m), el cim més alt de Catalunya?',
      options: ['Al Pallars Sobirà', 'Al Maresme', 'Al Pla d’Urgell'],
      correctIndex: 0,
      explanation: 'Súper! La Pica d’Estats (3.143 m) és el sostre de Catalunya i es troba al Pallars Sobirà.',
    },
  },
  {
    num: 6,
    emoji: '❄️',
    title: 'Els paisatges de muntanya',
    subtitle: 'Com són el relleu, la neu, els boscos i la vida a la muntanya?',
    badge: 'Diapositiva 6 · Muntanya (II)',
    mapMode: 'muntanya-detail',
    steps: [
      {
        heading: '🏞️ Cims alts, valls i estanys',
        body: 'Cims punxeguts, valls profundes, llacs d’origen glacial i rius d’aigua fresca com la Noguera Pallaresa, el Segre, el Ter o el Garona.',
        highlightComarques: ['26', '39', '31'],
      },
      {
        heading: '🌲 Boscos d’avets i prats verds',
        body: 'A l’hivern hi fa fred i hi neva, i a l’estiu hi fa fresca. Hi creixen boscos de pi negre, avets i faigs.',
        highlightComarques: ['19', '05'],
      },
      {
        heading: '🐄 Com hi viu la gent?',
        body: 'Pobles petits amb cases de pedra i teulades inclinades de pissarra. S’hi treballa en la ramaderia, el bosc, l’energia de l’aigua i l’esquí.',
        highlightComarques: ['15', '04'],
      },
    ],
    question: {
      prompt: '🏠 Per què les cases dels pobles d’alta muntanya tenen les teulades tan inclinades?',
      options: [
        'Només perquè quedi bonic',
        'Perquè la neu de l’hivern llisqui i no s’acumuli pes a sobre',
        'Perquè no hi plou mai',
      ],
      correctIndex: 1,
      explanation: 'Exacte! Així la neu rellisca sola i el sostre no s’esfondra pel pes.',
    },
  },
  {
    num: 7,
    emoji: '🌾',
    title: 'Les comarques de plana',
    subtitle: 'Les grans planes d’interior, conques de rius i altiplans (color verd)',
    badge: 'Diapositiva 7 · Plana (I)',
    mapMode: 'plana-map',
    steps: [
      {
        heading: '🚜 Les grans planes de Ponent (Lleida)',
        body: 'El Segrià, el Pla d’Urgell, l’Urgell, la Noguera, la Segarra i les Garrigues.',
        highlightComarques: ['33', '27', '38', '23', '32', '18'],
      },
      {
        heading: '🌿 Catalunya Central i planes de Girona',
        body: 'El Bages, Osona, l’Anoia, el Moianès, el Lluçanès, el Gironès i el Pla de l’Estany.',
        highlightComarques: ['07', '24', '06', '42', '43', '20', '28'],
      },
      {
        heading: '🍇 Planes prelitorals i de l’Ebre',
        body: 'El Vallès Occidental, el Vallès Oriental, l’Alt Penedès, l’Alt Camp, la Conca de Barberà i la Ribera d’Ebre.',
        highlightComarques: ['40', '41', '03', '01', '16', '30'],
      },
    ],
    question: {
      prompt: '📏 Quina és la comarca més gran en superfície de tota Catalunya?',
      options: ['El Barcelonès', 'La Noguera', 'El Pla de l’Estany'],
      correctIndex: 1,
      explanation: 'Molt bé! La Noguera (amb capital a Balaguer) és la comarca més extensa de Catalunya.',
    },
  },
  {
    num: 8,
    emoji: '🍎',
    title: 'Els paisatges de plana',
    subtitle: 'Camps de conreu, arbres fruiters, rius amples i ciutats actives',
    badge: 'Diapositiva 8 · Plana (II)',
    mapMode: 'plana-detail',
    steps: [
      {
        heading: '🏞️ Terrenys plans i rius grans',
        body: 'Terres planes o amb turons suaus travessades per grans rius com el Segre, l’Ebre, el Llobregat o el Ter.',
        highlightComarques: ['33', '07', '30'],
      },
      {
        heading: 'オリーブ Conreus de secà i de regadiu',
        body: 'Al secà hi ha blat, ordi, vinyes, oliveres i ametllers. Als regadius hi ha pomeres, pereres, presseguers i horta!',
        highlightComarques: ['27', '03', '18'],
      },
      {
        heading: '🚆 Ciutats, fàbriques i carreteres',
        body: 'Com que el terreny és pla, és més fàcil fer-hi vies de tren, autopistes, indústries i ciutats grans.',
        highlightComarques: ['40', '41', '20', '24'],
      },
    ],
    question: {
      prompt: '🌾 Quins conreus són típics dels camps de secà a les planes catalanes?',
      options: [
        'Cereals (blat i ordi), vinya, oliveres i ametllers',
        'Arròs i algues marines',
        'Plàtans i cocos tropicals',
      ],
      correctIndex: 0,
      explanation: 'Correcte! El blat, la vinya, l’olivera i l’ametller són els reis del secà mediterrani.',
    },
  },
  {
    num: 9,
    emoji: '🏖️',
    title: 'Les comarques del litoral',
    subtitle: 'Les 12 comarques que toquen al mar Mediterrani (color blau)',
    badge: 'Diapositiva 9 · Litoral (I)',
    mapMode: 'litoral-map',
    steps: [
      {
        heading: '⛵ El litoral nord (Costa Brava)',
        body: 'L’Alt Empordà, el Baix Empordà i la Selva formen la preciosa Costa Brava.',
        highlightComarques: ['02', '10', '34'],
      },
      {
        heading: '🏙️ El litoral central (Costa de Barcelona)',
        body: 'El Maresme, el Barcelonès, el Baix Llobregat i el Garraf, on viuen milions de persones.',
        highlightComarques: ['21', '13', '11', '17'],
      },
      {
        heading: '🦩 El litoral sud (Costa Daurada i Terres de l’Ebre)',
        body: 'El Baix Penedès, el Tarragonès, el Baix Camp, el Baix Ebre i el Montsià (amb el Delta de l’Ebre).',
        highlightComarques: ['12', '36', '08', '09', '22'],
      },
    ],
    question: {
      prompt: '🏙️ Quina és la comarca més petita en mida però on viu més gent de tot Catalunya?',
      options: ['El Barcelonès', 'L’Alt Empordà', 'El Montsià'],
      correctIndex: 0,
      explanation: 'Exacte! Al Barcelonès (amb Barcelona i 4 ciutats veïnes) hi viuen més de 2,4 milions de persones!',
    },
  },
  {
    num: 10,
    emoji: '🐬',
    title: 'Els paisatges del litoral',
    subtitle: 'Cales, platges de sorra, deltes amb flamencs i ports marítims!',
    badge: 'Diapositiva 10 · Litoral (II)',
    mapMode: 'litoral-detail',
    steps: [
      {
        heading: '🪨 Costa alta i costa baixa',
        body: 'Tenim costa rocosa amb penya-segats i cales (Costa Brava, Garraf) i costa baixa amb platges llargues de sorra (Maresme, Costa Daurada).',
        highlightComarques: ['02', '10', '21', '36'],
      },
      {
        heading: '🦩 Els deltes dels rius',
        body: 'Quan els rius arriben al mar formen terres planes i humides plenes d’ocells i arrossars, com el Delta de l’Ebre o el Delta del Llobregat.',
        highlightComarques: ['09', '22', '11'],
      },
      {
        heading: '🎨 Comarques amb paisatge mixt!',
        body: 'Algunes comarques tenen mar, plana i muntanya alhora, com l’Alt Empordà, el Baix Camp o el Baix Ebre!',
        highlightComarques: ['02', '09', '08', '34'],
      },
    ],
    question: {
      prompt: '🦩 Quin gran delta ple d’arrossars i flamencs comparteixen el Baix Ebre i el Montsià?',
      options: ['El Delta de l’Ebre', 'La Vall de Núria', 'L’Estany de Banyoles'],
      correctIndex: 0,
      explanation: 'Molt bé! El Delta de l’Ebre és la zona humida més gran de Catalunya.',
    },
  },
  {
    num: 11,
    emoji: '🏛️',
    title: 'Les quatre províncies',
    subtitle: 'Barcelona, Girona, Lleida i Tarragona i les seves capitals',
    badge: 'Diapositiva 11 · Les 4 províncies',
    mapMode: 'provincies',
    steps: [
      {
        heading: '4️⃣ Quatre grans províncies',
        body: 'Catalunya també es divideix en 4 províncies: Barcelona, Girona, Lleida i Tarragona. Cadascuna té el nom de la seva capital!',
      },
      {
        heading: '🔴🟠 Barcelona i Tarragona',
        body: 'Barcelona és la més poblada (al centre). Tarragona és al sud (Camp de Tarragona i Terres de l’Ebre).',
        focusProvinciaCodi: '08',
      },
      {
        heading: '🔵🟣 Girona i Lleida',
        body: 'Girona és al nord-est (Pirineu fins a la Costa Brava). Lleida és a l’oest: la més gran i l’única que no té mar!',
        focusProvinciaCodi: '25',
      },
    ],
    question: {
      prompt: '🗺️ Quina és l’única província de Catalunya que no té mar, però és la més gran en superfície?',
      options: ['Girona', 'Tarragona', 'Lleida'],
      correctIndex: 2,
      explanation: 'Correcte! La província de Lleida és interior i és la més gran de les quatre.',
    },
  },
  {
    num: 12,
    emoji: '🌋',
    title: 'Les comarques de Girona',
    subtitle: 'Un exemple de prop: des del Pirineu i els volcans fins a la Costa Brava!',
    badge: 'Diapositiva 12 · Explorant Girona',
    mapMode: 'girona-prov',
    steps: [
      {
        heading: '🔵 Les 6 comarques totes gironines',
        body: 'L’Alt Empordà (Figueres), el Baix Empordà (la Bisbal), el Gironès (Girona), el Pla de l’Estany (Banyoles), la Garrotxa (Olot) i el Ripollès (Ripoll).',
        highlightComarques: ['02', '10', '20', '28', '19', '31'],
      },
      {
        heading: '🌊⛰️ La Selva i la Cerdanya gironina',
        body: 'La Selva (25 pobles a Girona) i la meitat est de la Cerdanya (11 pobles a Girona, amb Puigcerdà i Llívia).',
        highlightComarques: ['34', '15'],
      },
      {
        heading: '🌲 I 3 pobles d’Osona!',
        body: 'Espinelves, Vidrà i Viladrau són 3 pobles de la comarca d’Osona que pertanyen a la província de Girona!',
        highlightComarques: ['24'],
      },
    ],
    question: {
      prompt: '🌋 Quina comarca de Girona és famosa pels seus volcans i la Fageda d’en Jordà, amb capital a Olot?',
      options: ['La Garrotxa', 'El Baix Empordà', 'El Gironès'],
      correctIndex: 0,
      explanation: 'Exacte! La Garrotxa és la terra dels volcans de Catalunya.',
    },
  },
  {
    num: 13,
    emoji: '🔍',
    title: 'Comparem comarques i províncies',
    subtitle: 'Per què hi ha 4 comarques amb pobles en dues províncies?',
    badge: 'Diapositiva 13 · Comarques compartides',
    mapMode: 'compare-com-prov',
    steps: [
      {
        heading: '🧩 43 comarques/Aran vs. 4 províncies',
        body: 'Les comarques són més petites i properes als pobles. Les províncies són divisions molt més grans.',
      },
      {
        heading: '✂️ Línies que tallen 4 comarques!',
        body: 'Fixa’t en la línia de punts del mapa: hi ha 4 comarques on la frontera provincial passa pel mig!',
        highlightComarques: ['15', '24', '14', '34'],
      },
      {
        heading: '🌟 Les 4 comarques multiprovincials',
        body: '1) Cerdanya (Girona i Lleida), 2) Osona (Barcelona i Girona), 3) Berguedà (Barcelona i Gósol a Lleida), i 4) La Selva (Girona i Fogars a Barcelona).',
        highlightComarques: ['15', '24', '14', '34'],
      },
    ],
    question: {
      prompt: '🏔️ Quina comarca del Pirineu té 11 municipis a Girona i 6 municipis a Lleida?',
      options: ['La Cerdanya', 'El Maresme', 'El Tarragonès'],
      correctIndex: 0,
      explanation: 'Molt bé! La Cerdanya està repartida entre les províncies de Girona i Lleida.',
    },
  },
  {
    num: 14,
    emoji: '🧠',
    title: 'Què hem après?',
    subtitle: 'Repassem els súper poders geogràfics abans del Repte Final!',
    badge: 'Diapositiva 14 · Gran repàs',
    mapMode: 'summary',
    steps: [
      {
        heading: '1️⃣ Municipis, Comarques i Províncies',
        body: '947 municipis agrupats en 42 comarques + l’Aran (amb el Lluçanès), i 4 províncies (Barcelona, Girona, Lleida i Tarragona).',
      },
      {
        heading: '2️⃣ Els 3 grans paisatges',
        body: 'Muntanya (marró: Pirineus, cims i neu), Plana (verd: conreus i ciutats d’interior) i Litoral (blau: platges, cales i deltes).',
      },
      {
        heading: '3️⃣ El relleu i les persones',
        body: 'El relleu influeix en el clima, els treballs, el transport i on vivim. I moltes comarques tenen paisatge mixt!',
      },
    ],
    question: {
      prompt: '🎯 Quantes unitats comarcals té Catalunya si sumem les 42 comarques i la Val d’Aran?',
      options: ['38', '41', '43 (42 comarques + l’Aran)'],
      correctIndex: 2,
      explanation: 'Excel·lent! Són 42 comarques més l’entitat territorial singular d’Aran: 43 en total!',
    },
  },
  {
    num: 15,
    emoji: '🏆',
    title: 'Repte final!',
    subtitle: 'Joc en equip a la pissarra digital: supereu les 5 missions!',
    badge: 'Diapositiva 15 · El Gran Repte de 4t!',
    mapMode: 'final-challenge',
    steps: [
      {
        heading: '🎮 Com es juga al Repte Final?',
        body: 'A sota teniu 5 missions secretes. Un nen o nena surt a la pissarra i toca la comarca correcta al mapa!',
      },
      {
        heading: '🤝 Treball en equip',
        body: 'Tota la classe pot donar pistes sobre si és al nord, al sud, a la muntanya, a la plana o al litoral!',
      },
      {
        heading: '🏅 Objectiu: Medalla d’Or de Catalunya!',
        body: 'Quan encerteu les 5 missions del mapa, guanyareu el trofeu d’Exploradors i Exploradores de 4t!',
      },
    ],
    question: {
      prompt: '🚀 Esteu a punt per superar les 5 missions clicant al mapa de la dreta?',
      options: [
        'Sí! Som-hi a tocar el mapa!',
        'Encara ens preparem',
        'Ho provem després',
      ],
      correctIndex: 0,
      explanation: 'Som-hi! Llegiu la Missió a la caixa groga i feu clic sobre el mapa!',
    },
  },
];

const FINAL_MISSIONS = [
  {
    codi: '43',
    clue: '🌟 Missió 1: Toca el Lluçanès, la comarca més nova de Catalunya (capital: Prats de Lluçanès)!',
  },
  {
    codi: '39',
    clue: '🏔️ Missió 2: Toca la Val d’Aran, on neix el riu Garona i es parla l’aranès (capital: Vielha)!',
  },
  {
    codi: '19',
    clue: '🌋 Missió 3: Toca la Garrotxa, la comarca dels volcans i la Fageda d’en Jordà (capital: Olot)!',
  },
  {
    codi: '40',
    clue: '👯 Missió 4: Toca el Vallès Occidental, la comarca amb dues capitals (Sabadell i Terrassa)!',
  },
  {
    codi: '22',
    clue: '🦩 Missió 5: Toca el Montsià, la comarca de més al sud, al Delta de l’Ebre (capital: Amposta)!',
  },
];

const PASTEL_COLORS = [
  '#7dd3fc',
  '#86efac',
  '#fde047',
  '#fda4af',
  '#c4b5fd',
  '#fdba74',
  '#6ee7b7',
];

export const PresentationSection: React.FC<PresentationSectionProps> = ({
  onBackToMenu,
}) => {
  const [slideIdx, setSlideIdx] = useState<number>(0);
  const [revealedStepsCount, setRevealedStepsCount] = useState<number>(1);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [selectedMapComarca, setSelectedMapComarca] = useState<ComarcaFeature | null>(null);
  const [showNamesOnSlide, setShowNamesOnSlide] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [missionIdx, setMissionIdx] = useState<number>(0);
  const [missionMsg, setMissionMsg] = useState<string>(
    '👆 Toca la comarca al mapa de la dreta per superar la Missió 1!'
  );
  const [missionsCompleted, setMissionsCompleted] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentSlide = SLIDES[slideIdx];

  useEffect(() => {
    setRevealedStepsCount(1);
    setSelectedAnswerIdx(null);
    setSelectedMapComarca(null);
    if (currentSlide.num === 15) {
      setShowNamesOnSlide(false);
    } else {
      setShowNamesOnSlide(true);
    }
  }, [slideIdx, currentSlide.num]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setSlideIdx(prev => Math.min(SLIDES.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setSlideIdx(prev => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      setIsFullscreen(false);
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    }
  };

  const activeStepHighlights: string[] =
    currentSlide.steps[revealedStepsCount - 1]?.highlightComarques || [];

  const getSlideComarcaFill = (comarca: ComarcaFeature): string => {
    if (selectedMapComarca?.codi === comarca.codi) return '#f59e0b';
    if (activeStepHighlights.includes(comarca.codi)) return '#fde047';

    switch (currentSlide.mapMode) {
      case 'muntanya-map':
      case 'muntanya-detail':
        return comarca.didactic.paisatgePrincipal === 'muntanya'
          ? PAISATGE_META.muntanya.colorHex
          : '#f1f5f9';
      case 'plana-map':
      case 'plana-detail':
        return comarca.didactic.paisatgePrincipal === 'plana'
          ? PAISATGE_META.plana.colorHex
          : '#f1f5f9';
      case 'litoral-map':
      case 'litoral-detail':
        return comarca.didactic.paisatgePrincipal === 'litoral'
          ? PAISATGE_META.litoral.colorHex
          : '#f1f5f9';
      case 'provincies':
      case 'compare-com-prov': {
        const mapProv: Record<string, string> = {
          Barcelona: '08',
          Girona: '17',
          Lleida: '25',
          Tarragona: '43',
        };
        const pCodi = mapProv[comarca.provinciaPrincipal] || '08';
        return PROVINCIES_INFO[pCodi].colorHex;
      }
      case 'girona-prov': {
        const inGirona = comarca.provincies.some(p => p.nom === 'Girona');
        if (!inGirona) return '#f1f5f9';
        return comarca.provinciaPrincipal === 'Girona' ? '#0284c7' : '#38bdf8';
      }
      case 'summary':
        return PAISATGE_META[comarca.didactic.paisatgePrincipal].colorHex;
      case 'final-challenge':
        return '#ffffff';
      default: {
        const idx = parseInt(comarca.codi, 10) % PASTEL_COLORS.length;
        return PASTEL_COLORS[idx];
      }
    }
  };

  const handleMapClickOnSlide = (comarca: ComarcaFeature) => {
    setSelectedMapComarca(comarca);
    if (currentSlide.num === 15 && !missionsCompleted) {
      const targetMission = FINAL_MISSIONS[missionIdx];
      if (comarca.codi === targetMission.codi) {
        if (missionIdx + 1 < FINAL_MISSIONS.length) {
          setMissionIdx(prev => prev + 1);
          setMissionMsg(`🌟 Súper bé! Era ${comarca.nom}! Ara anem a per la següent missió!`);
        } else {
          setMissionsCompleted(true);
          setMissionMsg(
            '🏆 FELICITATS A TOTA LA CLASSE! Heu completat les 5 missions del Repte Final!'
          );
          confetti({ particleCount: 120, spread: 85, origin: { y: 0.6 } });
        }
      } else {
        setMissionMsg(
          `🙈 Has tocat ${comarca.nom} (capital: ${comarca.capital}). Torna-ho a provar!`
        );
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`kid-card bg-gradient-to-br from-sky-100 via-[#fffbeb] to-emerald-100 text-slate-800 border-amber-400 overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0' : 'min-h-[760px]'
      }`}
    >
      {/* Top Sunny Presentation Control Bar */}
      <div className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 px-4 sm:px-6 py-3 border-b-4 border-amber-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToMenu}
            className="kid-btn px-3.5 py-1.5 bg-white hover:bg-amber-50 text-slate-900 border-amber-500 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4 text-rose-500" />
            <span>🏠 Menú d’inici</span>
          </button>
          <span className="px-3.5 py-1 rounded-full bg-white border-2 border-amber-500 text-amber-950 text-xs font-extrabold shadow-2xs">
            ✨ {currentSlide.badge}
          </span>
        </div>

        {/* Slide Number Pills (1..15) */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
          {SLIDES.map((s, idx) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setSlideIdx(idx)}
              className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 border-2 ${
                idx === slideIdx
                  ? 'bg-rose-500 text-white border-rose-800 scale-110 shadow-sm'
                  : 'bg-white/90 hover:bg-white text-slate-700 border-amber-400'
              }`}
              title={`${s.num}. ${s.title}`}
            >
              {s.num}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNamesOnSlide(v => !v)}
            className="kid-btn px-3 py-1.5 bg-white hover:bg-sky-50 border-sky-400 text-sky-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-sky-600" />
            <span>🏷️ {showNamesOnSlide ? 'Amaga noms' : 'Mostra noms'}</span>
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="kid-btn px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 border-indigo-900 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Surt pantalla completa</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>📺 Pantalla completa</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Slide Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-7 items-stretch overflow-y-auto">
        {/* Left Column: Title + Progressive Steps + Question */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="bg-white/90 p-4 rounded-3xl border-3 border-amber-300 shadow-xs flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-3xl shrink-0">
                {currentSlide.emoji}
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  {currentSlide.num}. {currentSlide.title}
                </h2>
                <p className="text-sm sm:text-base text-sky-800 font-bold mt-0.5">
                  {currentSlide.subtitle}
                </p>
              </div>
            </div>

            {/* Progressive Discovery Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  👣 Descoberta pas a pas ({revealedStepsCount}/{currentSlide.steps.length})
                </span>
                {revealedStepsCount < currentSlide.steps.length && (
                  <button
                    type="button"
                    onClick={() => setRevealedStepsCount(c => c + 1)}
                    className="kid-btn px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 border-amber-700 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 animate-bounce cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>✨ Destapa el pas {revealedStepsCount + 1}!</span>
                  </button>
                )}
              </div>

              {currentSlide.steps.map((step, i) => {
                const isRevealed = i < revealedStepsCount;
                const isCurrentStep = i === revealedStepsCount - 1;
                return (
                  <div
                    key={i}
                    onClick={() => setRevealedStepsCount(i + 1)}
                    className={`p-4 rounded-3xl border-3 transition-all cursor-pointer ${
                      isRevealed
                        ? isCurrentStep
                          ? 'bg-white border-amber-500 shadow-md scale-[1.01]'
                          : 'bg-white/85 border-sky-300'
                        : 'bg-white/40 border-dashed border-slate-300 opacity-65 hover:opacity-95'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center shrink-0 border-2 ${
                          isRevealed
                            ? 'bg-amber-400 text-slate-950 border-amber-600'
                            : 'bg-slate-200 text-slate-600 border-slate-300'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                        {step.heading}
                      </h3>
                    </div>
                    {isRevealed ? (
                      <p className="mt-2 text-sm sm:text-base font-medium text-slate-700 leading-relaxed pl-9">
                        {step.body}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs font-bold text-sky-700 pl-9">
                        👆 Fes clic aquí per destapar aquesta pista...
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Slide 15 Special Interactive Classroom Challenge */}
            {currentSlide.num === 15 && (
              <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-200 via-yellow-100 to-orange-200 border-3 border-amber-500 space-y-2 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-700" /> Missió a la pissarra ({missionIdx + 1}/
                    {FINAL_MISSIONS.length})
                  </span>
                  {missionsCompleted && (
                    <button
                      type="button"
                      onClick={() => {
                        setMissionIdx(0);
                        setMissionsCompleted(false);
                        setMissionMsg('👆 Toca la comarca al mapa per superar la Missió 1!');
                      }}
                      className="text-xs font-extrabold text-rose-700 underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Torna a jugar
                    </button>
                  )}
                </div>
                <p className="text-base sm:text-lg font-black text-slate-900">
                  {missionsCompleted
                    ? '🏆 SOU UNS CAMPIONS I CAMPIONES DE LES COMARQUES DE CATALUNYA!'
                    : FINAL_MISSIONS[missionIdx].clue}
                </p>
                <p className="text-xs font-bold text-amber-900">{missionMsg}</p>
              </div>
            )}
          </div>

          {/* Interactive Classroom Question Box */}
          <div className="p-4 rounded-3xl bg-white border-3 border-sky-400 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-sky-800 text-xs font-extrabold uppercase tracking-wider">
              <span>🙋‍♂️🙋‍♀️ Pregunta per a tota la classe!</span>
            </div>
            <p className="font-extrabold text-base sm:text-lg text-slate-900">
              {currentSlide.question.prompt}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {currentSlide.question.options.map((opt, idx) => {
                const isSelected = selectedAnswerIdx === idx;
                const isCorrect = idx === currentSlide.question.correctIndex;
                let btnStyle = 'bg-sky-50 hover:bg-sky-100 text-slate-900 border-sky-300';
                if (selectedAnswerIdx !== null) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-400 text-slate-950 border-emerald-700';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-400 text-white border-rose-700';
                  }
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAnswerIdx(idx)}
                    className={`kid-btn p-2.5 text-xs sm:text-sm font-extrabold text-left cursor-pointer ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {selectedAnswerIdx !== null && (
              <div className="p-3 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-xs sm:text-sm font-bold text-emerald-950 flex items-start gap-2 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
                <span>{currentSlide.question.explanation}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Interactive Map Protagonist */}
        <div className="lg:col-span-6 flex flex-col gap-3 min-h-[460px]">
          <div className="flex-1">
            <CataloniaMap
              selectedCodi={selectedMapComarca?.codi || null}
              onSelectComarca={handleMapClickOnSlide}
              getComarcaFill={getSlideComarcaFill}
              showComarcaNames={showNamesOnSlide}
              showCapitalNames={currentSlide.mapMode === 'capitals'}
              showProvinciaBorders={
                currentSlide.mapMode === 'provincies' ||
                currentSlide.mapMode === 'compare-com-prov' ||
                currentSlide.mapMode === 'girona-prov'
              }
              showProvinciaCapitals={currentSlide.mapMode === 'provincies'}
              externalFocusBBox={
                currentSlide.mapMode === 'girona-prov'
                  ? PROVINCIES_DATA.find(p => p.codi === '17')?.bbox || null
                  : null
              }
            />
          </div>

          {/* Mini Pop-up Bar when clicking any comarca on the slide map */}
          <div className="bg-white border-3 border-amber-400 rounded-3xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            {selectedMapComarca ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-300 border-2 border-amber-500 flex items-center justify-center text-xl">
                    📍
                  </div>
                  <div>
                    <p className="font-extrabold text-base text-slate-900">
                      {selectedMapComarca.nom}{' '}
                      <span className="text-rose-600 font-extrabold text-sm">
                        (Capital: {selectedMapComarca.capital})
                      </span>
                    </p>
                    <p className="text-xs font-medium text-slate-600">
                      {selectedMapComarca.didactic.resumPaisatge}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs font-bold text-slate-700">
                  <p>
                    👨‍👩‍👧‍👦 <strong>{selectedMapComarca.poblacio.toLocaleString('ca-ES')} hab.</strong>
                  </p>
                  <p>
                    🏛️ Província: <strong>{selectedMapComarca.provinciaPrincipal}</strong>
                  </p>
                </div>
              </>
            ) : (
              <p className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                <span className="text-lg">👆</span>
                <span>
                  <strong>Mapa màgic en viu:</strong> Toca qualsevol comarca del mapa per descobrir com es diu i quina és la seva capital!
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Slide Navigation Footer */}
      <div className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 px-6 py-3.5 border-t-4 border-amber-400 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setSlideIdx(prev => Math.max(0, prev - 1))}
          disabled={slideIdx === 0}
          className="kid-btn px-4 py-2 bg-white hover:bg-amber-50 disabled:opacity-40 text-slate-900 border-amber-500 font-extrabold text-sm flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>⬅️ Anterior</span>
        </button>

        <span className="text-xs sm:text-sm font-extrabold text-amber-950 bg-white/80 px-4 py-1.5 rounded-full border-2 border-amber-400">
          🌟 Diapositiva <strong>{slideIdx + 1}</strong> de <strong>{SLIDES.length}</strong>
        </span>

        <button
          type="button"
          onClick={() => setSlideIdx(prev => Math.min(SLIDES.length - 1, prev + 1))}
          disabled={slideIdx === SLIDES.length - 1}
          className="kid-btn px-4 py-2 bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-white border-rose-800 font-extrabold text-sm flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          <span>Següent ➡️</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
