import React, { useState, useMemo } from 'react';
import { COMARQUES_DATA, ComarcaFeature } from '../utils/cartography';
import {
  PAISATGE_META,
  PREGUNTES_PAISATGE,
  PaisatgeTipus,
} from '../data/comarquesInfo';
import { CataloniaMap } from './CataloniaMap';
import { ComarcaDetailCard } from './ComarcaDetailCard';
import {
  Mountain,
  Trees,
  Waves,
  ChevronDown,
  ChevronUp,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface LandscapeSectionProps {
  discoveredCodis: string[];
  onToggleDiscovered: (codi: string) => void;
  onMarkDiscovered: (codi: string) => void;
}

type FilterCategory = 'totes' | PaisatgeTipus | 'mixt';

export const LandscapeSection: React.FC<LandscapeSectionProps> = ({
  discoveredCodis,
  onToggleDiscovered,
  onMarkDiscovered,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('totes');
  const [includeMixedInCategory, setIncludeMixedInCategory] = useState<boolean>(true);
  const [showNames, setShowNames] = useState<boolean>(true);
  const [selectedComarca, setSelectedComarca] = useState<ComarcaFeature>(() => {
    return COMARQUES_DATA.find(c => c.codi === '26') || COMARQUES_DATA[0];
  });
  const [openQuestionId, setOpenQuestionId] = useState<string | null>('p1');
  const [revealedQuestions, setRevealedQuestions] = useState<Record<string, boolean>>({});

  const matchesCategory = (comarca: ComarcaFeature, cat: FilterCategory): boolean => {
    if (cat === 'totes') return true;
    if (cat === 'mixt') return comarca.didactic.esMixt;
    if (comarca.didactic.paisatgePrincipal === cat) return true;
    if (includeMixedInCategory && comarca.didactic.paisatgesSecundaris?.includes(cat)) {
      return true;
    }
    return false;
  };

  const matchingComarques = useMemo(
    () => COMARQUES_DATA.filter(c => matchesCategory(c, activeFilter)),
    [activeFilter, includeMixedInCategory]
  );

  const getComarcaFill = (comarca: ComarcaFeature): string => {
    const isMatch = matchesCategory(comarca, activeFilter);
    if (!isMatch) return '#f1f5f9';

    if (
      (activeFilter === 'muntanya' || activeFilter === 'plana' || activeFilter === 'litoral') &&
      includeMixedInCategory &&
      comarca.didactic.paisatgePrincipal !== activeFilter &&
      comarca.didactic.paisatgesSecundaris?.includes(activeFilter)
    ) {
      return PAISATGE_META[activeFilter].colorHex;
    }

    return PAISATGE_META[comarca.didactic.paisatgePrincipal].colorHex;
  };

  const getComarcaOpacity = (comarca: ComarcaFeature): number => {
    const isMatch = matchesCategory(comarca, activeFilter);
    if (!isMatch) return 0.35;
    if (selectedComarca?.codi === comarca.codi) return 1;
    if (
      (activeFilter === 'muntanya' || activeFilter === 'plana' || activeFilter === 'litoral') &&
      comarca.didactic.paisatgePrincipal !== activeFilter
    ) {
      return 0.65;
    }
    return 0.9;
  };

  const handleSelectComarca = (comarca: ComarcaFeature) => {
    setSelectedComarca(comarca);
    onMarkDiscovered(comarca.codi);
  };

  return (
    <div className="space-y-6">
      {/* Category Selector Header */}
      <div className="kid-card bg-white border-emerald-400 p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              🏔️🌾🏖️ Muntanya, Plana i Litoral: Els 3 grans paisatges!
            </h2>
            <p className="text-sm font-semibold text-slate-600">
              Tria un color per pintar el mapa i descobreix com són les muntanyes, les planes i la costa de Catalunya!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowNames(v => !v)}
              className={`kid-btn px-3.5 py-2 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer ${
                showNames
                  ? 'bg-sky-500 text-white border-sky-700'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>🏷️ {showNames ? 'Amaga noms' : 'Mostra noms'}</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            type="button"
            onClick={() => setActiveFilter('totes')}
            className={`kid-btn p-3 text-left flex items-center gap-2.5 cursor-pointer ${
              activeFilter === 'totes'
                ? 'bg-violet-600 text-white border-violet-900'
                : 'bg-violet-50 hover:bg-violet-100 text-violet-950 border-violet-300'
            }`}
          >
            <span className="text-2xl">🌈</span>
            <div>
              <p className="font-extrabold text-sm leading-tight">Tots els paisatges</p>
              <p className="text-[11px] opacity-85">43 comarques i Aran</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('muntanya')}
            className={`kid-btn p-3 text-left flex items-center gap-2.5 cursor-pointer ${
              activeFilter === 'muntanya'
                ? 'bg-amber-800 text-white border-amber-950'
                : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-400'
            }`}
          >
            <span className="text-2xl">🏔️</span>
            <div>
              <p className="font-extrabold text-sm leading-tight">Muntanya (Marró)</p>
              <p className="text-[11px] opacity-85">Pirineu, neu i valls</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('plana')}
            className={`kid-btn p-3 text-left flex items-center gap-2.5 cursor-pointer ${
              activeFilter === 'plana'
                ? 'bg-emerald-700 text-white border-emerald-950'
                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border-emerald-400'
            }`}
          >
            <span className="text-2xl">🌾</span>
            <div>
              <p className="font-extrabold text-sm leading-tight">Plana (Verd)</p>
              <p className="text-[11px] opacity-85">Camps, rius i ciutats</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('litoral')}
            className={`kid-btn p-3 text-left flex items-center gap-2.5 cursor-pointer ${
              activeFilter === 'litoral'
                ? 'bg-sky-600 text-white border-sky-900'
                : 'bg-sky-100 hover:bg-sky-200 text-sky-950 border-sky-400'
            }`}
          >
            <span className="text-2xl">🏖️</span>
            <div>
              <p className="font-extrabold text-sm leading-tight">Litoral (Blau)</p>
              <p className="text-[11px] opacity-85">Platges, cales i deltes</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('mixt')}
            className={`kid-btn p-3 text-left flex items-center gap-2.5 col-span-2 sm:col-span-1 cursor-pointer ${
              activeFilter === 'mixt'
                ? 'bg-amber-400 text-slate-950 border-amber-700'
                : 'bg-yellow-50 hover:bg-yellow-100 text-amber-950 border-amber-300'
            }`}
          >
            <span className="text-2xl">🎨</span>
            <div>
              <p className="font-extrabold text-sm leading-tight">Paisatges mixtos</p>
              <p className="text-[11px] opacity-85">Combinen 2 o 3 paisatges!</p>
            </div>
          </button>
        </div>

        {/* Didactic Toggle for Mixed Landscapes */}
        {(activeFilter === 'muntanya' || activeFilter === 'plana' || activeFilter === 'litoral') && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-amber-50 px-4 py-2.5 rounded-2xl border-2 border-amber-300">
            <span className="text-amber-950 font-semibold">
              💡 <strong>Ho sabies?</strong> Algunes comarques tenen mar, plana i muntanya alhora (com l’Alt Empordà, el Baix Camp o el Baix Ebre)!
            </span>
            <label className="flex items-center gap-2 font-extrabold text-slate-900 cursor-pointer">
              <input
                type="checkbox"
                checked={includeMixedInCategory}
                onChange={e => setIncludeMixedInCategory(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
              <span>Inclou també les comarques amb paisatge mixt</span>
            </label>
          </div>
        )}
      </div>

      {/* Main Map + Comarca Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-7 h-[520px] lg:h-[660px] flex flex-col">
          <CataloniaMap
            selectedCodi={selectedComarca?.codi}
            onSelectComarca={handleSelectComarca}
            getComarcaFill={getComarcaFill}
            getComarcaOpacity={getComarcaOpacity}
            getComarcaStroke={() => '#ffffff'}
            showComarcaNames={showNames}
            legendSlot={
              <div className="bg-white/95 backdrop-blur-sm p-3.5 rounded-2xl border-3 border-emerald-400 shadow-md text-xs space-y-1.5">
                <p className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px]">
                  🎨 Colors del paisatge
                </p>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-md bg-[#b45309] border border-amber-950" />
                  <span className="font-bold text-slate-800">🏔️ Muntanya (Marró)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-md bg-[#15803d] border border-emerald-950" />
                  <span className="font-bold text-slate-800">🌾 Plana (Verd)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-md bg-[#0284c7] border border-sky-950" />
                  <span className="font-bold text-slate-800">🏖️ Litoral (Blau)</span>
                </div>
                <p className="text-[11px] font-bold text-emerald-800 pt-0.5">
                  ✨ Comarques pintades: {matchingComarques.length}
                </p>
              </div>
            }
          />
        </div>

        <div className="lg:col-span-5 h-auto lg:h-[660px]">
          <ComarcaDetailCard
            comarca={selectedComarca}
            isDiscovered={discoveredCodis.includes(selectedComarca.codi)}
            onToggleDiscovered={onToggleDiscovered}
            highlightLandscape
          />
        </div>
      </div>

      {/* Visual Comparison of the 3 Landscapes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['muntanya', 'plana', 'litoral'] as PaisatgeTipus[]).map(tipus => {
          const meta = PAISATGE_META[tipus];
          const emoji = tipus === 'muntanya' ? '🏔️' : tipus === 'plana' ? '🌾' : '🏖️';
          return (
            <div
              key={tipus}
              className="kid-card bg-white overflow-hidden flex flex-col"
              style={{ borderColor: meta.colorHex }}
            >
              <div
                className="p-4 text-white flex items-center justify-between"
                style={{ backgroundColor: meta.colorHex }}
              >
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider bg-black/20 px-2.5 py-0.5 rounded-full">
                    {emoji} Paisatge de {tipus}
                  </span>
                  <h3 className="text-xl font-extrabold mt-1">{meta.titol}</h3>
                </div>
                {tipus === 'muntanya' && <Mountain className="w-10 h-10 opacity-90" />}
                {tipus === 'plana' && <Trees className="w-10 h-10 opacity-90" />}
                {tipus === 'litoral' && <Waves className="w-10 h-10 opacity-90" />}
              </div>

              <div className="p-4 space-y-3 text-sm flex-1 flex flex-col justify-between">
                <p className="text-slate-700 font-semibold leading-relaxed">{meta.descripcio}</p>

                <div className="space-y-2">
                  <div className="p-3 rounded-2xl bg-amber-50/70 border-2 border-amber-200">
                    <p className="text-xs font-extrabold uppercase text-amber-900 mb-1">
                      ⛰️ Com és el relleu?
                    </p>
                    <ul className="text-xs font-medium text-slate-700 space-y-1 list-disc list-inside">
                      {meta.relleu.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-2xl bg-sky-50/70 border-2 border-sky-200">
                    <p className="text-xs font-extrabold uppercase text-sky-900 mb-1">
                      👩‍🌾 Què hi fan les persones?
                    </p>
                    <ul className="text-xs font-medium text-slate-700 space-y-1 list-disc list-inside">
                      {meta.activitats.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveFilter(tipus)}
                  className="kid-btn w-full py-2.5 font-extrabold text-xs cursor-pointer"
                  style={{
                    backgroundColor: meta.colorLightHex,
                    borderColor: meta.colorHex,
                    color: meta.colorBorderHex,
                  }}
                >
                  {emoji} Pinta les comarques de {tipus} al mapa ↑
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Questions for Kids */}
      <div className="kid-card bg-white border-amber-400 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-300 border-2 border-amber-500 flex items-center justify-center text-2xl shrink-0">
            🤔
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Detectius del paisatge! (Preguntes per pensar a classe)
            </h3>
            <p className="text-sm font-semibold text-slate-600">
              Pensa la resposta amb els teus companys i companyes, i després destapa la solució!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {PREGUNTES_PAISATGE.map(q => {
            const isOpen = openQuestionId === q.id;
            const isRevealed = Boolean(revealedQuestions[q.id]);
            return (
              <div
                key={q.id}
                className={`rounded-2xl border-3 transition-all overflow-hidden ${
                  isOpen
                    ? 'border-sky-400 bg-sky-50/60 shadow-sm'
                    : 'border-amber-200 bg-amber-50/40 hover:border-amber-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenQuestionId(isOpen ? null : q.id)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer"
                >
                  <span className="font-extrabold text-base text-slate-900">
                    ❓ {q.pregunta}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-sky-700 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-amber-700 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t-2 border-sky-200 pt-3">
                    <div className="flex items-start gap-2 text-xs bg-amber-100 border-2 border-amber-300 text-amber-950 p-3 rounded-xl font-semibold">
                      <span className="text-base">💡</span>
                      <span>
                        <strong>Pista de detectiu:</strong> {q.pista}
                      </span>
                    </div>

                    {!isRevealed ? (
                      <button
                        type="button"
                        onClick={() =>
                          setRevealedQuestions(prev => ({ ...prev, [q.id]: true }))
                        }
                        className="kid-btn px-4 py-2 bg-sky-500 hover:bg-sky-400 border-sky-700 text-white font-extrabold text-xs cursor-pointer"
                      >
                        ✨ Destapa la resposta!
                      </button>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-white border-2 border-emerald-300 space-y-2 animate-fadeIn">
                        <p className="text-sm font-semibold text-slate-800 leading-relaxed flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{q.resposta}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-xs font-extrabold text-slate-600">
                            📍 Mira-les al mapa:
                          </span>
                          {q.exemplesComarques.map(nomCom => {
                            const found = COMARQUES_DATA.find(c => c.nom === nomCom);
                            return (
                              <button
                                key={nomCom}
                                type="button"
                                onClick={() => found && handleSelectComarca(found)}
                                className="px-2.5 py-1 rounded-xl bg-sky-100 hover:bg-sky-200 border border-sky-300 text-sky-950 text-xs font-extrabold cursor-pointer"
                              >
                                {nomCom}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
