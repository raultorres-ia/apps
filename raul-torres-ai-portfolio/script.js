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
    "about.p2": "I began my journey in 2002, creating guerrilla-style short films with minimal resources and a strong focus on narrative and visual expression. After a period away from filmmaking, I have returned with a renewed perspective—embracing AI as a creative tool that expands possibilities without replacing the human vision behind each story.",
    "about.p3": "My work explores how technology can serve emotion, meaning, and cinematic language. I am particularly interested in creating pieces that connect with audiences on a human level, using innovative techniques to enhance storytelling rather than distract from it.",
    "about.p4": "Projects like POWER OFF reflect this approach: combining visual experimentation with a clear narrative intention and a strong emotional core.",
    "about.p5": "This portfolio brings together my recent work in AI-driven filmmaking, where each project represents a step forward in exploring new forms of audiovisual expression.",
    "about.noteLabel": "Creative focus",
    "about.note": "Cinema, emotional realism and AI-assisted audiovisual exploration.",
    "works.eyebrow": "Selected works",
    "works.title": "Audiovisual projects",
    "project.title": "POWER OFF",
    "project.description1": "On one side, a mother and her daughter survive in an environment devastated by war.",
    "project.description2": "On the other, a mother and her daughter live peacefully, unaware of the chaos outside.",
    "project.description3": "Same gestures. Same moments.",
    "project.description4": "Two opposing realities moving in perfect synchrony… until everything breaks.",
    "project.watch": "Watch POWER OFF",
    "project.awardsTitle": "Awards",
    "project.award1": "Best Concept Award: LAAIMPA WINNERS APRIL 2026",
    "project.finalistTitle": "Finalist",
    "project.finalist1": "Finalist AI Movie Awards",
    "project.selectionTitle": "Official Selection",
    "project.selection1": "BAIFF - Burano Artificial Intelligence Film Festival",
    "project.selection2": "AI Film Awards in Cannes 2026",
    "project.selection3": "TODO ES PROMPT - Chile",
    "project.selection4": "IA en CORTO - Chile",
    "project.techTitle": "Technologies used",
    "project.tech1": "Image and video: Nano Banana Pro, Kling 3.0",
    "project.tech2": "Sound: Suno AI, Eleven Labs",
    "project.tech3": "Editing: Filmora 14",
    "project.tech4": "Concept, screenplay and direction: Raül Torres",
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
    "about.p2": "Comencé mi camino en 2002, creando cortometrajes de guerrilla con recursos mínimos y una fuerte atención a la narrativa y la expresión visual. Después de un periodo alejado del cine, he regresado con una mirada renovada, adoptando la IA como una herramienta creativa que amplía posibilidades sin reemplazar la visión humana detrás de cada historia.",
    "about.p3": "Mi trabajo explora cómo la tecnología puede servir a la emoción, el significado y el lenguaje cinematográfico. Me interesa especialmente crear piezas que conecten con el público a nivel humano, utilizando técnicas innovadoras para potenciar la narración en lugar de distraer de ella.",
    "about.p4": "Proyectos como POWER OFF reflejan este enfoque: combinar experimentación visual con una intención narrativa clara y un fuerte núcleo emocional.",
    "about.p5": "Este portfolio reúne mi trabajo reciente en cine impulsado por IA, donde cada proyecto representa un paso adelante en la exploración de nuevas formas de expresión audiovisual.",
    "about.noteLabel": "Enfoque creativo",
    "about.note": "Cine, realismo emocional y exploración audiovisual asistida por IA.",
    "works.eyebrow": "Trabajos seleccionados",
    "works.title": "Proyectos audiovisuales",
    "project.title": "POWER OFF",
    "project.description1": "Por un lado, una madre y su hija sobreviven en un entorno devastado por la guerra.",
    "project.description2": "Por otro, una madre y su hija viven en paz, ajenas al caos exterior.",
    "project.description3": "Los mismos gestos. Los mismos momentos.",
    "project.description4": "Dos realidades opuestas avanzando en perfecta sincronía… hasta que todo se rompe.",
    "project.watch": "Ver POWER OFF",
    "project.awardsTitle": "Premios",
    "project.award1": "Best Concept Award: LAAIMPA WINNERS APRIL 2026",
    "project.finalistTitle": "Finalista",
    "project.finalist1": "Finalista AI Movie Awards",
    "project.selectionTitle": "Selección oficial",
    "project.selection1": "BAIFF - Burano Artificial Intelligence Film Festival",
    "project.selection2": "AI Film Awards in Cannes 2026",
    "project.selection3": "TODO ES PROMPT - Chile",
    "project.selection4": "IA en CORTO - Chile",
    "project.techTitle": "Tecnologías utilizadas",
    "project.tech1": "Imagen y vídeo: Nano Banana Pro, Kling 3.0",
    "project.tech2": "Sonido: Suno AI, Eleven Labs",
    "project.tech3": "Edición: Filmora 14",
    "project.tech4": "Concepto, guion y dirección: Raül Torres",
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
