const fallbackData = {
  brand: "Tu Marca",
  heroTitle: "Muestro mis trabajos para RRSS con impacto visual",
  heroSubtitle:
    "Produccion audiovisual, diseno y contenidos optimizados para Instagram, TikTok y YouTube.",
  mainCtaText: "Ver trabajos",
  mainCtaHref: "#trabajos",
  secondaryCtaText: "Redes",
  secondaryCtaHref: "#rrss",
  contactHref: "#contacto",
  powerOffDescription:
    "Una historia breve y contundente para conectar con audiencias digitales.",
  footerText: "Disponible para colaboraciones y nuevos proyectos.",
  works: [
    {
      title: "POWER OFF",
      description: "Cortometraje principal para difusion en redes."
    },
    {
      title: "Pieza Teaser",
      description: "Formato corto vertical para Reels y Shorts."
    },
    {
      title: "Post Promocional",
      description: "Creatividad estatica para impulsar alcance."
    }
  ],
  socialLinks: [
    { platform: "Instagram", url: "https://instagram.com/" },
    { platform: "TikTok", url: "https://www.tiktok.com/" },
    { platform: "YouTube", url: "https://www.youtube.com/" }
  ]
};

const fallbackSocialIcons = [
  {
    image: "linkedin.png",
    url: "https://www.linkedin.com/in/ra%C3%BAl-torres-a18217365/"
  },
  {
    image: "instagram.png",
    url: "https://www.instagram.com/raul_torres_ia/"
  },
  { image: "x.png", url: "https://x.com/rtorres_co" },
  { image: "youtube.png", url: "https://www.youtube.com/@ra%C3%BAltorres_2b" }
];

function safeValue(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function inferPlatformName(filename) {
  const base = filename.replace(/\.[^.]+$/, "").toLowerCase();
  if (base === "x") return "X";
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function renderSocialIcons(items) {
  const container = document.getElementById("socialIcons");
  container.innerHTML = "";

  items.forEach((item) => {
    const image = safeValue(item.image, "");
    const url = safeValue(item.url, "#");
    if (!image) return;

    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", inferPlatformName(image));

    const icon = document.createElement("img");
    icon.src = image;
    icon.alt = inferPlatformName(image);

    link.appendChild(icon);
    container.appendChild(link);
  });
}

function parseSocialIconsFromText(rawText) {
  if (!rawText || !rawText.trim()) return [];
  const lines = rawText.split(/\r?\n/);
  const items = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const match = trimmed.match(/^(\S+\.(?:png|jpg|jpeg|webp|svg))\s+(https?:\/\/\S+)$/i);
    if (!match) return;

    items.push({ image: match[1], url: match[2] });
  });

  return items;
}

function renderApp(data) {
  const brand = safeValue(data.brand, fallbackData.brand);
  const heroTitle = safeValue(data.heroTitle, fallbackData.heroTitle);
  const heroSubtitle = safeValue(data.heroSubtitle, fallbackData.heroSubtitle);
  const mainCtaText = safeValue(data.mainCtaText, fallbackData.mainCtaText);
  const mainCtaHref = safeValue(data.mainCtaHref, fallbackData.mainCtaHref);
  const secondaryCtaText = safeValue(
    data.secondaryCtaText,
    fallbackData.secondaryCtaText
  );
  const secondaryCtaHref = safeValue(
    data.secondaryCtaHref,
    fallbackData.secondaryCtaHref
  );
  const contactHref = safeValue(data.contactHref, fallbackData.contactHref);
  const powerOffDescription = safeValue(
    data.powerOffDescription,
    fallbackData.powerOffDescription
  );
  const footerText = safeValue(data.footerText, fallbackData.footerText);

  document.getElementById("brandName").textContent = brand;
  document.getElementById("heroTitle").textContent = heroTitle;
  document.getElementById("heroSubtitle").textContent = heroSubtitle;
  document.getElementById("mainCta").textContent = mainCtaText;
  document.getElementById("mainCta").href = mainCtaHref;
  document.getElementById("secondaryCta").textContent = secondaryCtaText;
  document.getElementById("secondaryCta").href = secondaryCtaHref;
  document.getElementById("contactLink").href = contactHref;
  document.getElementById("powerOffDescription").textContent = powerOffDescription;
  document.getElementById("footerText").textContent = footerText;

  const works =
    Array.isArray(data.works) && data.works.length ? data.works : fallbackData.works;
  const socialLinks =
    Array.isArray(data.socialLinks) && data.socialLinks.length
      ? data.socialLinks
      : fallbackData.socialLinks;

  const worksGrid = document.getElementById("worksGrid");
  worksGrid.innerHTML = "";
  works.forEach((work) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <h3>${safeValue(work.title, "Proyecto")}</h3>
      <p>${safeValue(work.description, "Descripcion pendiente.")}</p>
    `;
    worksGrid.appendChild(card);
  });

  const socialGrid = document.getElementById("socialGrid");
  socialGrid.innerHTML = "";
  socialLinks.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    const platform = safeValue(item.platform, "Red social");
    const url = safeValue(item.url, "#");
    card.innerHTML = `
      <h3>${platform}</h3>
      <p><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></p>
    `;
    socialGrid.appendChild(card);
  });
}

async function loadData() {
  try {
    const response = await fetch("RRSS.txt");
    const rawText = await response.text();
    if (!rawText.trim()) return fallbackData;
    return JSON.parse(rawText);
  } catch {
    return fallbackData;
  }
}

async function loadFooterLinks() {
  try {
    const response = await fetch("enlaces.txt");
    const rawText = await response.text();
    const parsed = parseSocialIconsFromText(rawText);
    if (parsed.length) return parsed;
    return fallbackSocialIcons;
  } catch {
    return fallbackSocialIcons;
  }
}

Promise.all([loadData(), loadFooterLinks()]).then(([data, socialIcons]) => {
  renderApp(data);
  renderSocialIcons(socialIcons);
});
