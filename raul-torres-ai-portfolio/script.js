// Language copy lives here so the static HTML stays simple to edit.
const translations = {
  en: {
    "nav.home": "Home",
    "nav.about": "About",
    "nav.works": "Works",
    "nav.contact": "Contact",
    "hero.eyebrow": "Raül Torres",
    "hero.title": "Creative Portfolio",
    "hero.subtitle": "AI Filmmaker | Storytelling | Education & Generative AI",
    "hero.cta": "View my work",
    "about.eyebrow": "About",
    "about.title": "A camera, a story, a new language",
    "about.p1": "I am an audiovisual creator working at the intersection of storytelling and artificial intelligence.",
    "about.p2": "I began my journey in cinema in 2002, creating guerrilla-style short films with minimal resources, but with a deep attention to narrative and visual expression. After a period away from the medium, I returned with a renewed perspective, incorporating artificial intelligence as a creative tool capable of expanding the possibilities of audiovisual language without replacing the human vision behind each story.",
    "about.p3": "My work explores how technology can serve emotion, meaning and cinematic language. I am especially interested in creating pieces that connect with audiences on a human level, using innovative techniques to strengthen storytelling rather than distract the viewer from it.",
    "about.p4": "Projects like POWER OFF reflect this philosophy: combining visual experimentation, technological exploration and a clear narrative intention with a strong emotional core.",
    "about.p5": "This portfolio brings together my recent work in AI-driven filmmaking, where each project represents a new step in the search for contemporary forms of audiovisual expression, always with narrative and emotion as the central axis.",
    "about.quote": "\"GenAI tools expire quickly, but storytelling lasts forever\"",
    "about.noteLabel": "Creative focus",
    "about.note": "Cinema, emotional realism and AI-assisted audiovisual exploration.",
    "project.title": "POWER OFF",
    "project.description1": "On one side, a mother and her daughter survive in an environment devastated by war.",
    "project.description2": "On the other, a mother and her daughter live peacefully, unaware of the chaos outside.",
    "project.description3": "Same gestures. Same moments.",
    "project.description4": "Two opposing realities moving in perfect synchrony... until everything breaks.",
    "project.watch": "Watch POWER OFF",
    "project.awardsTitle": "Awards",
    "project.award1": "Best Concept Award: LAAIMPA WINNERS APRIL 2026 - Los Ángeles",
    "project.awardInterview": "Watch POWER interview",
    "project.finalistTitle": "Finalist",
    "project.finalist1": "Finalist AI Movie Awards - Mallorca",
    "project.finalist2": "Quarter-Finalist AI Awards INDIA",
    "project.selectionTitle": "Official Selection",
    "project.selection1": "BAIFF - Burano Artificial Intelligence Film Festival",
    "project.selection2": "AI Film Awards in Cannes 2026",
    "project.selection3": "TODO ES PROMPT - Chile",
    "project.selection4": "IA en CORTO - Chile",
    "project.selection5": "ICJ International Film Award - Ukraine",
    "project.selection6": "SEOUL INTERNATIONAL AI Film Festival",
    "project.selection7": "AI Film Awards INDIA",
    "project.platformsTitle": "Platforms where POWER OFF is featured",
    "project.platform1Name": "JAMESDRAKE TV",
    "project.platform1Description": "James Drake TV (JDTV) is a creative platform and YouTube channel focused on the dissemination of art, history, and science through the use of artificial intelligence to create cinematic narratives.",
    "project.platform2Name": "Cinferno",
    "project.platform2Description": "Selected to be part of the showcase of the year's top 100 AI films.",
    "project.techTitle": "Technologies used",
    "project.tech1": "Image and video: Nano Banana Pro, Kling 3.0",
    "project.tech2": "Sound: Suno AI, Eleven Labs",
    "project.tech3": "Editing: Filmora 14",
    "project.tech4": "Concept, screenplay and direction: Raül Torres",
    "elevator.title": "ELEVATOR",
    "elevator.description1": "A man enters an old elevator on a rainy night.",
    "elevator.description2": "As it descends, an unsettling sense of strangeness begins to take hold of him.",
    "elevator.description3": "Through silence, lingering glances, and an increasingly oppressive atmosphere, the journey leads him toward a place where nothing is quite as familiar as it seems.",
    "elevator.watch": "Watch ELEVATOR",
    "elevator.techTitle": "Technologies used",
    "elevator.tech1": "Assisted by ChatGPT 5.5",
    "elevator.tech2": "Character and Environment Design by Midjourney 8.1",
    "elevator.tech3": "Character and Environment Consistency by GPT Image 2.0",
    "elevator.tech4": "Editing by Filmora 14",
    "elevator.tech5": "Concept, script, and direction: Raül Torres",
    "lesOmbres.title": "Les ombres que ens acompanyen",
    "lesOmbres.description1": "Book trailer created for writer Cesc Cornet for his novel \"Les ombres que ens acompanyen\".",
    "lesOmbres.description2": "Three stories. Two cities. No apparent connection... and a breathtaking finale.",
    "lesOmbres.description3": "A multi-threaded thriller that will keep you on edge.",
    "lesOmbres.description4": "A thriller set between Barcelona and Vizcaya, where three seemingly unrelated cases gradually intertwine until they converge in a heart-stopping ending. Pure adrenaline.",
    "lesOmbres.watch": "Watch video",
    "lesOmbres.techTitle": "AI tools used",
    "lesOmbres.tech1": "Veo 3.1",
    "lesOmbres.tech2": "Nanobanana Pro",
    "lesOmbres.tech3": "Suno",
    "lesOmbres.tech4": "Filmora 14",
    "ultimoAliento.title": "El último aliento",
    "ultimoAliento.description1": "A powerful micro-documentary exploring the devastating effects of plastic waste on our oceans and the urgent need to protect marine life.",
    "ultimoAliento.watch": "Watch video",
    "ultimoAliento.techTitle": "Tools used",
    "ultimoAliento.tech1": "Video generated with Veo 2",
    "ultimoAliento.tech2": "Sounds created with MMAudio (local)",
    "ultimoAliento.tech3": "Voice with Eleven Labs",
    "ultimoAliento.tech4": "Music composed with Suno",
    "ultimoAliento.tech5": "Assembly and editing in Filmora 14",
    "legadoIa.title": "Trailer: El legado de la IA",
    "legadoIa.description1": "A Cinematic Concept Trailer Created Entirely with Artificial Intelligence.",
    "legadoIa.watch": "Watch trailer",
    "legadoIa.techTitle": "Tools used",
    "legadoIa.tech1": "Video generated with Runway",
    "legadoIa.tech2": "Character design with Flux.1",
    "legadoIa.tech3": "Assisted with ChatGPT 4",
    "legadoIa.tech4": "Voice with Eleven Labs",
    "legadoIa.tech5": "Music composed with Suno",
    "legadoIa.tech6": "Assembly and editing in Filmora 13",
    "contact.eyebrow": "Contact",
    "contact.title": "Follow my work",
    "contact.linkedin": "LinkedIn",
    "contact.instagram": "Instagram",
    "contact.youtube": "YouTube",
    "footer.copyright": "© 2026 Raül Torres. Creative Portfolio.",
    "footer.tagline": "Cinema with AI, human perspective."
  },
  es: {
    "nav.home": "Inicio",
    "nav.about": "Sobre mí",
    "nav.works": "Trabajos",
    "nav.contact": "Contacto",
    "hero.eyebrow": "Raül Torres",
    "hero.title": "Portfolio Creativo",
    "hero.subtitle": "Cineasta con IA | Storytelling | Educación e IA Generativa",
    "hero.cta": "Ver mi trabajo",
    "about.eyebrow": "Sobre mí",
    "about.title": "Una cámara, una historia, un nuevo lenguaje",
    "about.p1": "Soy un creador audiovisual que trabaja en la intersección entre la narración y la inteligencia artificial.",
    "about.p2": "Comencé mi camino en el cine en 2002, creando cortometrajes de guerrilla con recursos mínimos, pero con una profunda atención a la narrativa y a la expresión visual. Tras un periodo alejado del medio, regresé con una mirada renovada, incorporando la inteligencia artificial como una herramienta creativa capaz de ampliar las posibilidades del lenguaje audiovisual sin sustituir la visión humana que existe detrás de cada historia.",
    "about.p3": "Mi trabajo explora cómo la tecnología puede servir a la emoción, al significado y al lenguaje cinematográfico. Me interesa especialmente crear piezas que conecten con el público a nivel humano, utilizando técnicas innovadoras para potenciar la narración en lugar de distraer al espectador de ella.",
    "about.p4": "Proyectos como POWER OFF reflejan esta filosofía: combinar experimentación visual, exploración tecnológica y una intención narrativa clara con un fuerte núcleo emocional.",
    "about.p5": "Este portfolio reúne mi trabajo reciente en cine impulsado por IA, donde cada proyecto representa un nuevo paso en la búsqueda de formas contemporáneas de expresión audiovisual, siempre con la narrativa y la emoción como eje central.",
    "about.quote": "\"Las herramientas de IAG caducan en poco tiempo pero el storytelling perdura para siempre\"",
    "about.noteLabel": "Enfoque creativo",
    "about.note": "Cine, realismo emocional y exploración audiovisual asistida por IA.",
    "project.title": "POWER OFF",
    "project.description1": "Por un lado, una madre y su hija sobreviven en un entorno devastado por la guerra.",
    "project.description2": "Por otro, una madre y su hija viven en paz, ajenas al caos exterior.",
    "project.description3": "Los mismos gestos. Los mismos momentos.",
    "project.description4": "Dos realidades opuestas avanzando en perfecta sincronía... hasta que todo se rompe.",
    "project.watch": "Ver POWER OFF",
    "project.awardsTitle": "Premios",
    "project.award1": "Best Concept Award: LAAIMPA WINNERS APRIL 2026 - Los Ángeles",
    "project.awardInterview": "Ver entrevista de POWER",
    "project.finalistTitle": "Finalista",
    "project.finalist1": "Finalist AI Movie Awards - Mallorca",
    "project.finalist2": "Quarter-Finalist AI Awards INDIA",
    "project.selectionTitle": "Selección oficial",
    "project.selection1": "BAIFF - Burano Artificial Intelligence Film Festival",
    "project.selection2": "AI Film Awards in Cannes 2026",
    "project.selection3": "TODO ES PROMPT - Chile",
    "project.selection4": "IA en CORTO - Chile",
    "project.selection5": "ICJ International Film Award - Ukraine",
    "project.selection6": "SEOUL INTERNATIONAL AI Film Festival",
    "project.selection7": "AI Film Awards INDIA",
    "project.platformsTitle": "Plataformas donde aparece POWER OFF",
    "project.platform1Name": "JAMESDRAKE TV",
    "project.platform1Description": "James Drake TV (JDTV) es una plataforma creativa y canal de YouTube centrado en la difusión del arte, la historia y la ciencia mediante el uso de inteligencia artificial para crear narrativas cinematográficas.",
    "project.platform2Name": "Cinferno",
    "project.platform2Description": "Seleccionado para formar parte del escaparate de las 100 mejores películas de IA del año.",
    "project.techTitle": "Tecnologías utilizadas",
    "project.tech1": "Imagen y vídeo: Nano Banana Pro, Kling 3.0",
    "project.tech2": "Sonido: Suno AI, Eleven Labs",
    "project.tech3": "Edición: Filmora 14",
    "project.tech4": "Concepto, guion y dirección: Raül Torres",
    "elevator.title": "ELEVATOR",
    "elevator.description1": "Un hombre entra en un viejo ascensor en una noche lluviosa.",
    "elevator.description2": "Mientras desciende, una inquietante sensación de extrañeza empieza a apoderarse de él.",
    "elevator.description3": "A través del silencio, las miradas sostenidas y una atmósfera cada vez más opresiva, el viaje lo conduce hacia un lugar donde nada resulta tan familiar como parece.",
    "elevator.watch": "Ver ELEVATOR",
    "elevator.techTitle": "Tecnologías utilizadas",
    "elevator.tech1": "Asistido por ChatGPT 5.5",
    "elevator.tech2": "Diseño de personajes y entornos por Midjourney 8.1",
    "elevator.tech3": "Consistencia de personajes y entornos por GPT Image 2.0",
    "elevator.tech4": "Edición por Filmora 14",
    "elevator.tech5": "Concepto, guion y dirección: Raül Torres",
    "lesOmbres.title": "Les ombres que ens acompanyen",
    "lesOmbres.description1": "Tráiler literario creado para el escritor Cesc Cornet y su novela \"Les ombres que ens acompanyen\".",
    "lesOmbres.description2": "Tres historias. Dos ciudades. Sin conexión aparente... y un desenlace de infarto.",
    "lesOmbres.description3": "Un thriller coral que te mantendrá en tensión.",
    "lesOmbres.description4": "Un thriller ambientado entre Barcelona y Vizcaya, donde tres casos aparentemente inconexos se entrelazan poco a poco hasta converger en un final sobrecogedor. Pura adrenalina.",
    "lesOmbres.watch": "Ver vídeo",
    "lesOmbres.techTitle": "Herramientas de IA utilizadas",
    "lesOmbres.tech1": "Veo 3.1",
    "lesOmbres.tech2": "Nanobanana Pro",
    "lesOmbres.tech3": "Suno",
    "lesOmbres.tech4": "Filmora 14",
    "ultimoAliento.title": "El último aliento",
    "ultimoAliento.description1": "Un poderoso microdocumental que explora los efectos devastadores de los residuos plásticos en nuestros océanos y la necesidad urgente de proteger la vida marina.",
    "ultimoAliento.watch": "Ver vídeo",
    "ultimoAliento.techTitle": "Herramientas utilizadas",
    "ultimoAliento.tech1": "Vídeo generado con Veo 2",
    "ultimoAliento.tech2": "Sonidos creados con MMAudio (en local)",
    "ultimoAliento.tech3": "Voz con Eleven Labs",
    "ultimoAliento.tech4": "Música compuesta con Suno",
    "ultimoAliento.tech5": "Montaje y edición en Filmora 14",
    "legadoIa.title": "Trailer: El legado de la IA",
    "legadoIa.description1": "Un tráiler conceptual cinematográfico creado íntegramente con inteligencia artificial.",
    "legadoIa.watch": "Ver tráiler",
    "legadoIa.techTitle": "Herramientas utilizadas",
    "legadoIa.tech1": "Vídeo generado con Runway",
    "legadoIa.tech2": "Diseño de personajes con Flux.1",
    "legadoIa.tech3": "Asistido con ChatGPT 4",
    "legadoIa.tech4": "Voz con Eleven Labs",
    "legadoIa.tech5": "Música compuesta con Suno",
    "legadoIa.tech6": "Montaje y edición en Filmora 13",
    "contact.eyebrow": "Contacto",
    "contact.title": "Sigue mi trabajo",
    "contact.linkedin": "LinkedIn",
    "contact.instagram": "Instagram",
    "contact.youtube": "YouTube",
    "footer.copyright": "© 2026 Raül Torres. Portfolio Creativo.",
    "footer.tagline": "Cine con IA, mirada humana."
  }
};

// DOM references
const languageToggle = document.querySelector("#language-toggle");
const languageCodes = document.querySelectorAll("[data-lang-label]");
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const navigationLinks = navigation.querySelectorAll("a");

let currentLanguage = "en";

// Swap every element marked with data-i18n without reloading the page.
function applyLanguage(language) {
  document.documentElement.lang = language;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    element.textContent = translations[language][key];
  });

  languageCodes.forEach((code) => {
    code.classList.toggle("is-active", code.dataset.langLabel === language);
  });

  const nextLanguage = language === "en" ? "Spanish" : "English";
  languageToggle.setAttribute("aria-label", `Switch language to ${nextLanguage}`);
}

// Mobile navigation closes after selecting an anchor link.
function closeNavigation() {
  document.body.classList.remove("nav-open");
  navigation.classList.remove("is-open");
  menuToggle.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

languageToggle.addEventListener("click", () => {
  currentLanguage = currentLanguage === "en" ? "es" : "en";
  applyLanguage(currentLanguage);
});

menuToggle.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("is-open");
  document.body.classList.toggle("nav-open", isOpen);
  menuToggle.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navigationLinks.forEach((link) => {
  link.addEventListener("click", closeNavigation);
});

applyLanguage(currentLanguage);
