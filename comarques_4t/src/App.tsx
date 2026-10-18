import React, { useState, useEffect } from 'react';
import { COMARQUES_DATA } from './utils/cartography';
import { PAISATGE_META } from './data/comarquesInfo';
import { CataloniaMap } from './components/CataloniaMap';
import { ExploreSection } from './components/ExploreSection';
import { LandscapeSection } from './components/LandscapeSection';
import { ProvincesSection } from './components/ProvincesSection';
import { BlankMapSection } from './components/BlankMapSection';
import { PresentationSection } from './components/PresentationSection';
import {
  Compass,
  Mountain,
  Map,
  Puzzle,
  Presentation,
  Home,
  Trophy,
  RotateCcw,
} from 'lucide-react';

export type AppSection =
  | 'home'
  | 'explorem'
  | 'paisatges'
  | 'provincies'
  | 'mapamut'
  | 'presentacio';

const STORAGE_DISCOVERED_KEY = 'cat_comarques_discovered_v1';
const STORAGE_BEST_SCORE_KEY = 'cat_comarques_best_score_v1';

const NAV_ITEMS: {
  id: Exclude<AppSection, 'home'>;
  num: number;
  emoji: string;
  title: string;
  shortTitle: string;
  desc: string;
  bgActive: string;
  cardBorder: string;
  cardBg: string;
  badgeBg: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: 'explorem',
    num: 1,
    emoji: '🧭',
    title: 'Explorem les comarques',
    shortTitle: '1. Explorem les comarques',
    desc: 'Viatja pel mapa de les 42 comarques i l’Aran (amb el Lluçanès!), descobreix les capitals i obre el passaport de cada comarca!',
    bgActive: 'bg-sky-500 text-white border-sky-800',
    cardBorder: 'border-sky-400 hover:border-sky-500',
    cardBg: 'from-sky-50 to-cyan-50',
    badgeBg: 'bg-sky-200 text-sky-950 border-sky-400',
    icon: Compass,
  },
  {
    id: 'paisatges',
    num: 2,
    emoji: '🏔️',
    title: 'Muntanya, plana i litoral',
    shortTitle: '2. Muntanya, plana i litoral',
    desc: 'Pinta el mapa de marró, verd i blau, descobreix els paisatges mixtos i juga a ser detectiu del paisatge!',
    bgActive: 'bg-emerald-500 text-white border-emerald-800',
    cardBorder: 'border-emerald-400 hover:border-emerald-500',
    cardBg: 'from-emerald-50 to-teal-50',
    badgeBg: 'bg-emerald-200 text-emerald-950 border-emerald-400',
    icon: Mountain,
  },
  {
    id: 'provincies',
    num: 3,
    emoji: '🏛️',
    title: 'Les quatre províncies',
    shortTitle: '3. Les quatre províncies',
    desc: 'Explora Barcelona, Girona, Lleida i Tarragona, compara dos mapes alhora i troba les 4 comarques compartides!',
    bgActive: 'bg-violet-500 text-white border-violet-800',
    cardBorder: 'border-violet-400 hover:border-violet-500',
    cardBg: 'from-violet-50 to-purple-50',
    badgeBg: 'bg-violet-200 text-violet-950 border-violet-400',
    icon: Map,
  },
  {
    id: 'mapamut',
    num: 4,
    emoji: '🎮',
    title: 'Mapa mut: practica i aprèn',
    shortTitle: '4. Mapa mut: practica i aprèn',
    desc: '4 jocs súper divertits (col·loca, endevina, arrossega etiquetes i províncies), 3 nivells, pantalla completa i mapa A4 per imprimir!',
    bgActive: 'bg-amber-400 text-slate-950 border-amber-700',
    cardBorder: 'border-amber-400 hover:border-amber-500',
    cardBg: 'from-amber-50 to-yellow-50',
    badgeBg: 'bg-amber-200 text-amber-950 border-amber-400',
    icon: Puzzle,
  },
  {
    id: 'presentacio',
    num: 5,
    emoji: '📺',
    title: 'Presentació interactiva',
    shortTitle: '5. Presentació interactiva',
    desc: '15 diapositives plenes de color per a la pissarra digital amb pistes pas a pas, mapes màgics i el Gran Repte Final de 4t!',
    bgActive: 'bg-rose-500 text-white border-rose-800',
    cardBorder: 'border-rose-400 hover:border-rose-500',
    cardBg: 'from-rose-50 to-pink-50',
    badgeBg: 'bg-rose-200 text-rose-950 border-rose-400',
    icon: Presentation,
  },
];

export function App() {
  const [activeSection, setActiveSection] = useState<AppSection>('home');
  const [discoveredCodis, setDiscoveredCodis] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DISCOVERED_KEY);
      return saved ? JSON.parse(saved) : ['07'];
    } catch {
      return ['07'];
    }
  });
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BEST_SCORE_KEY);
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_DISCOVERED_KEY, JSON.stringify(discoveredCodis));
    } catch {
      // ignore storage errors
    }
  }, [discoveredCodis]);

  const handleToggleDiscovered = (codi: string) => {
    setDiscoveredCodis(prev =>
      prev.includes(codi) ? prev.filter(c => c !== codi) : [...prev, codi]
    );
  };

  const handleMarkDiscovered = (codi: string) => {
    setDiscoveredCodis(prev => (prev.includes(codi) ? prev : [...prev, codi]));
  };

  const handleUpdateBestScore = (newScore: number) => {
    setBestScore(prev => {
      const best = Math.max(prev, newScore);
      try {
        localStorage.setItem(STORAGE_BEST_SCORE_KEY, String(best));
      } catch {
        // ignore
      }
      return best;
    });
  };

  const handleResetProgress = () => {
    setDiscoveredCodis([]);
    setBestScore(0);
    try {
      localStorage.removeItem(STORAGE_DISCOVERED_KEY);
      localStorage.removeItem(STORAGE_BEST_SCORE_KEY);
    } catch {
      // ignore
    }
  };

  const explorerRank =
    discoveredCodis.length >= 35
      ? '👑 Súper Mestre/a de Catalunya!'
      : discoveredCodis.length >= 15
      ? '🦅 Aventurer/a dels Paisatges!'
      : '🐣 Petit/a Explorador/a';

  return (
    <div className="min-h-screen flex flex-col text-slate-800">
      {/* Playful Kids Top Header & Navigation Bar */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-amber-300 via-yellow-200 to-sky-200 border-b-4 border-amber-400 shadow-sm print:hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Brand Title with Cute Mascot */}
          <button
            type="button"
            onClick={() => setActiveSection('home')}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-white border-3 border-amber-500 flex items-center justify-center text-2xl shadow-[0_4px_0_0_rgba(245,158,11,0.4)] group-hover:scale-110 transition-transform animate-float">
              🐉
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                  Descobrim les comarques de Catalunya!
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white border-2 border-rose-700 text-xs font-extrabold shadow-2xs">
                  🎒 4t de Primària
                </span>
              </div>
              <p className="text-xs text-slate-700 font-bold mt-0.5">
                🗺️ Explora, aprèn i juga amb les 42 comarques i la Val d’Aran!
              </p>
            </div>
          </button>

          {/* Kids Reward & Stars Badges */}
          <div className="hidden xl:flex items-center gap-2.5">
            <div className="px-3.5 py-1.5 rounded-2xl bg-white border-3 border-emerald-400 text-emerald-950 text-xs font-extrabold flex items-center gap-1.5 shadow-2xs">
              <span>{explorerRank}</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-2xl bg-white border-3 border-sky-400 text-sky-950 text-xs font-extrabold flex items-center gap-1.5 shadow-2xs">
              <span>⭐ Comarques: {discoveredCodis.length}/{COMARQUES_DATA.length}</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-2xl bg-white border-3 border-amber-400 text-amber-950 text-xs font-extrabold flex items-center gap-1.5 shadow-2xs">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Rècord: {bestScore} pts</span>
            </div>
          </div>
        </div>

        {/* Navigation Bar with 3D Toy Buttons */}
        <nav
          aria-label="Navegació principal"
          className="bg-white/85 backdrop-blur-xs border-t-2 border-amber-300 px-3 sm:px-6 py-2 overflow-x-auto"
        >
          <div className="max-w-[1600px] mx-auto flex items-center gap-2 min-w-max">
            <button
              type="button"
              onClick={() => setActiveSection('home')}
              className={`kid-btn px-3.5 py-2 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 cursor-pointer ${
                activeSection === 'home'
                  ? 'bg-slate-900 text-amber-300 border-slate-950'
                  : 'bg-amber-50 hover:bg-amber-100 text-slate-800 border-amber-300'
              }`}
            >
              <Home className="w-4 h-4 text-rose-500" />
              <span>🏠 Inici</span>
            </button>

            {NAV_ITEMS.map(item => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`kid-btn px-3.5 py-2 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? item.bgActive
                      : 'bg-white hover:bg-sky-50 text-slate-800 border-slate-300'
                  }`}
                >
                  <span className="text-base">{item.emoji}</span>
                  <span>{item.shortTitle}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-5">
        {activeSection === 'home' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Sunny Illustrated Storybook Hero Banner */}
            <div className="kid-card bg-gradient-to-br from-sky-200 via-amber-100 to-emerald-100 border-amber-400 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative overflow-hidden">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-amber-400 text-amber-950 text-xs sm:text-sm font-extrabold shadow-2xs">
                  <span className="text-lg">🐉</span>
                  <span>Hola, exploradors i exploradores de 4t de Primària!</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                  Preparats per a la gran aventura de les{' '}
                  <span className="text-sky-700">
                    comarques de Catalunya
                  </span>
                  ?
                </h2>

                <p className="text-base sm:text-lg font-semibold text-slate-700 leading-relaxed max-w-2xl">
                  Viatja per les nostres <strong className="text-amber-800">🏔️ muntanyes</strong>,{' '}
                  <strong className="text-emerald-800">🌾 planes</strong> i{' '}
                  <strong className="text-sky-800">🏖️ platges del litoral</strong>, coneix les{' '}
                  <strong className="text-violet-800">🏛️ 4 províncies</strong> i guanya estrelles jugant al{' '}
                  <strong className="text-rose-700">🎮 mapa mut interactiu</strong>!
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveSection('explorem')}
                    className="kid-btn px-5 py-3 bg-sky-500 hover:bg-sky-400 text-white border-sky-800 font-extrabold text-sm sm:text-base flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-xl">🧭</span>
                    <span>1. Explora el mapa ara!</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection('mapamut')}
                    className="kid-btn px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-700 font-extrabold text-sm sm:text-base flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-xl">🎮</span>
                    <span>4. Juga al Mapa Mut!</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection('presentacio')}
                    className="kid-btn px-5 py-3 bg-rose-500 hover:bg-rose-400 text-white border-rose-800 font-extrabold text-sm sm:text-base flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-xl">📺</span>
                    <span>5. Presentació de classe</span>
                  </button>
                </div>

                {/* Quick Territory Sticker Facts */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                  <div className="bg-white/95 rounded-2xl p-3 border-3 border-amber-400 shadow-2xs text-center">
                    <p className="text-2xl font-black text-amber-600">🧩 42 + 1</p>
                    <p className="text-xs font-extrabold text-slate-700">Comarques + l’Aran</p>
                  </div>
                  <div className="bg-white/95 rounded-2xl p-3 border-3 border-emerald-400 shadow-2xs text-center">
                    <p className="text-2xl font-black text-emerald-600">🏘️ 947</p>
                    <p className="text-xs font-extrabold text-slate-700">Pobles i ciutats</p>
                  </div>
                  <div className="bg-white/95 rounded-2xl p-3 border-3 border-sky-400 shadow-2xs text-center">
                    <p className="text-2xl font-black text-sky-600">🌈 3</p>
                    <p className="text-xs font-extrabold text-slate-700">Grans paisatges</p>
                  </div>
                  <div className="bg-white/95 rounded-2xl p-3 border-3 border-violet-400 shadow-2xs text-center">
                    <p className="text-2xl font-black text-violet-600">🏛️ 4</p>
                    <p className="text-xs font-extrabold text-slate-700">Províncies</p>
                  </div>
                </div>
              </div>

              {/* Interactive Mini Map Preview on Hero */}
              <div className="lg:col-span-5 h-[390px] sm:h-[430px]">
                <CataloniaMap
                  onSelectComarca={() => setActiveSection('explorem')}
                  getComarcaFill={c => PAISATGE_META[c.didactic.paisatgePrincipal].colorHex}
                  getComarcaStroke={() => '#ffffff'}
                  showComarcaNames={false}
                  showControls={false}
                  legendSlot={
                    <div className="bg-amber-300 text-slate-950 px-3.5 py-2 rounded-2xl text-xs font-extrabold border-3 border-slate-900 shadow-md animate-bounce">
                      👆 Toca el mapa per començar l’aventura!
                    </div>
                  }
                />
              </div>
            </div>

            {/* The 5 Main Adventure Worlds Grid */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <span>🎒 Tria la teva missió d’avui! (5 Apartats)</span>
                </h3>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-700 bg-white px-3.5 py-1.5 rounded-full border-2 border-amber-300">
                  <span>
                    ⭐ Passaport: <strong>{discoveredCodis.length}/43</strong> comarques descobertes
                  </span>
                  {(discoveredCodis.length > 1 || bestScore > 0) && (
                    <button
                      type="button"
                      onClick={handleResetProgress}
                      className="text-rose-600 hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reinicia
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {NAV_ITEMS.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={`kid-card group bg-gradient-to-b ${item.cardBg} ${item.cardBorder} p-5 text-left transition-all hover:-translate-y-1 flex flex-col justify-between gap-4 cursor-pointer`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black border-2 ${item.badgeBg}`}
                        >
                          Món {item.num}
                        </span>
                        <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-300 flex items-center justify-center text-2xl shadow-2xs group-hover:scale-110 transition-transform">
                          {item.emoji}
                        </div>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 group-hover:text-sky-800 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t-2 border-white/80 flex items-center justify-between text-xs font-black text-slate-900">
                      <span>Som-hi!</span>
                      <span className="w-7 h-7 rounded-full bg-white border-2 border-slate-800 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                        ➡️
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'explorem' && (
          <div className="animate-fadeIn">
            <ExploreSection
              discoveredCodis={discoveredCodis}
              onToggleDiscovered={handleToggleDiscovered}
              onMarkDiscovered={handleMarkDiscovered}
            />
          </div>
        )}

        {activeSection === 'paisatges' && (
          <div className="animate-fadeIn">
            <LandscapeSection
              discoveredCodis={discoveredCodis}
              onToggleDiscovered={handleToggleDiscovered}
              onMarkDiscovered={handleMarkDiscovered}
            />
          </div>
        )}

        {activeSection === 'provincies' && (
          <div className="animate-fadeIn">
            <ProvincesSection
              discoveredCodis={discoveredCodis}
              onToggleDiscovered={handleToggleDiscovered}
              onMarkDiscovered={handleMarkDiscovered}
            />
          </div>
        )}

        {activeSection === 'mapamut' && (
          <div className="animate-fadeIn">
            <BlankMapSection
              bestScore={bestScore}
              onUpdateBestScore={handleUpdateBestScore}
            />
          </div>
        )}

        {activeSection === 'presentacio' && (
          <div className="animate-fadeIn">
            <PresentationSection onBackToMenu={() => setActiveSection('home')} />
          </div>
        )}
      </main>

      {/* Stylized Footer with Authorship, Licenses & Cartographic Credits */}
      <footer className="mt-10 pb-8 px-4 sm:px-6 print:hidden">
        <div className="max-w-[1600px] mx-auto kid-card bg-gradient-to-br from-white via-amber-50/70 to-sky-50/70 border-amber-300 p-5 sm:p-6">
          {/* Top Row: Title & Author Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b-2 border-amber-200/80">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-xl shadow-2xs shrink-0">
                🗺️
              </div>
              <div>
                <p className="font-black text-slate-900 text-base sm:text-lg leading-tight">
                  Les comarques de Catalunya
                </p>
                <p className="text-xs sm:text-sm font-extrabold text-amber-900">
                  © 2026 Raül Torres
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://www.gnu.org/licenses/agpl-3.0.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-full bg-sky-100 hover:bg-sky-200 border-2 border-sky-300 text-sky-900 text-xs font-extrabold transition-colors"
              >
                ⚖️ Codi: AGPL v3
              </a>
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/deed.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-full bg-emerald-100 hover:bg-emerald-200 border-2 border-emerald-300 text-emerald-900 text-xs font-extrabold transition-colors"
              >
                📚 Continguts: CC BY-SA 4.0
              </a>
              <span className="px-3 py-1 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-950 text-xs font-extrabold">
                🧭 Cartografia: ICGC (CC BY 4.0) · Idescat
              </span>
            </div>
          </div>

          {/* Bottom 3-Column Visual License Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs sm:text-sm text-slate-700">
            <div className="bg-white/90 rounded-2xl p-3.5 border-2 border-sky-200 shadow-2xs flex items-start gap-2.5">
              <span className="text-lg shrink-0 mt-0.5">💻</span>
              <p className="leading-relaxed font-medium">
                El codi d&apos;aquesta aplicació està disponible sota la llicència{' '}
                <strong className="text-slate-900">AGPL v3</strong>. Consulteu el text complet a{' '}
                <a
                  href="https://www.gnu.org/licenses/agpl-3.0.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-700 hover:text-sky-900 underline font-bold break-all"
                >
                  https://www.gnu.org/licenses/agpl-3.0.html
                </a>
                .
              </p>
            </div>

            <div className="bg-white/90 rounded-2xl p-3.5 border-2 border-emerald-200 shadow-2xs flex items-start gap-2.5">
              <span className="text-lg shrink-0 mt-0.5">🎨</span>
              <p className="leading-relaxed font-medium">
                Els continguts educatius (textos, exercicis, vídeos i imatges) tenen la llicència{' '}
                <strong className="text-slate-900">CC BY-SA 4.0</strong>. Consulteu el text complet a{' '}
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/deed.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:text-emerald-900 underline font-bold break-all"
                >
                  https://creativecommons.org/licenses/by-sa/4.0/deed.ca
                </a>
                .
              </p>
            </div>

            <div className="bg-white/90 rounded-2xl p-3.5 border-2 border-amber-200 shadow-2xs flex items-start gap-2.5">
              <span className="text-lg shrink-0 mt-0.5">🏛️</span>
              <p className="leading-relaxed font-medium">
                Els materials de tercers inclosos conserven la seva pròpia llicència, indicada al costat de cadascun (Cartografia oficial:{' '}
                <strong className="text-slate-900">
                  Institut Cartogràfic i Geològic de Catalunya – ICGC
                </strong>
                , llicència CC BY 4.0; Dades demogràfiques:{' '}
                <strong className="text-slate-900">Idescat</strong>).
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
