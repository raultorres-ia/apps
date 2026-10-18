import React, { useState, useMemo } from 'react';
import { COMARQUES_DATA, ComarcaFeature, normalizeText } from '../utils/cartography';
import { PAISATGE_META } from '../data/comarquesInfo';
import { CataloniaMap } from './CataloniaMap';
import { ComarcaDetailCard } from './ComarcaDetailCard';
import {
  Search,
  Eye,
  EyeOff,
  MapPin,
  RotateCcw,
  Shuffle,
  CheckCircle2,
  X,
} from 'lucide-react';

interface ExploreSectionProps {
  discoveredCodis: string[];
  onToggleDiscovered: (codi: string) => void;
  onMarkDiscovered: (codi: string) => void;
}

// Vibrant, cheerful candy-pastel palette for kids
const EXPLORE_PALETTE = [
  '#7dd3fc',
  '#86efac',
  '#fde047',
  '#fda4af',
  '#c4b5fd',
  '#fdba74',
  '#6ee7b7',
  '#a5b4fc',
  '#f9a8d4',
  '#fef08a',
];

export const ExploreSection: React.FC<ExploreSectionProps> = ({
  discoveredCodis,
  onToggleDiscovered,
  onMarkDiscovered,
}) => {
  const [selectedComarca, setSelectedComarca] = useState<ComarcaFeature>(() => {
    return COMARQUES_DATA.find(c => c.codi === '07') || COMARQUES_DATA[0];
  });
  const [showComarcaNames, setShowComarcaNames] = useState<boolean>(true);
  const [showCapitalNames, setShowCapitalNames] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [focusBBox, setFocusBBox] = useState<{
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } | null>(null);
  const [colorMode, setColorMode] = useState<'pastel' | 'explorades'>('pastel');

  const filteredComarques = useMemo(() => {
    const q = normalizeText(searchQuery);
    if (!q) return COMARQUES_DATA;
    return COMARQUES_DATA.filter(
      c =>
        normalizeText(c.nom).includes(q) ||
        normalizeText(c.capital).includes(q) ||
        normalizeText(c.provinciaPrincipal).includes(q)
    );
  }, [searchQuery]);

  const handleSelectComarca = (comarca: ComarcaFeature, shouldZoom = false) => {
    setSelectedComarca(comarca);
    onMarkDiscovered(comarca.codi);
    if (shouldZoom) {
      setFocusBBox({ ...comarca.bbox });
    }
  };

  const handleRandomComarca = () => {
    const unvisited = COMARQUES_DATA.filter(c => !discoveredCodis.includes(c.codi));
    const pool = unvisited.length > 0 ? unvisited : COMARQUES_DATA;
    const random = pool[Math.floor(Math.random() * pool.length)];
    handleSelectComarca(random, true);
  };

  const handleResetGeneralView = () => {
    setFocusBBox(null);
  };

  const getComarcaFill = (comarca: ComarcaFeature) => {
    if (selectedComarca?.codi === comarca.codi) {
      return '#f59e0b';
    }
    if (searchQuery.trim() !== '') {
      const isMatch = filteredComarques.some(c => c.codi === comarca.codi);
      if (!isMatch) return '#f1f5f9';
      return '#38bdf8';
    }
    if (colorMode === 'explorades') {
      return discoveredCodis.includes(comarca.codi) ? '#4ade80' : '#ffffff';
    }
    const idx = parseInt(comarca.codi, 10) % EXPLORE_PALETTE.length;
    return EXPLORE_PALETTE[idx];
  };

  return (
    <div className="space-y-4">
      {/* Top Playful Toolbar */}
      <div className="kid-card bg-white border-sky-300 p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[230px] max-w-md">
          <Search className="w-5 h-5 text-sky-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="🔍 Busca una comarca o capital (ex: Lluçanès, Olot...)"
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl border-3 border-sky-200 focus:border-sky-500 focus:outline-none text-sm font-bold text-slate-800 bg-sky-50/50 focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-xl hover:bg-sky-200 text-slate-600 cursor-pointer"
              aria-label="Esborra la cerca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Playful 3D Toggle Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowComarcaNames(v => !v)}
            className={`kid-btn px-3.5 py-2 font-extrabold text-xs sm:text-sm flex items-center gap-2 cursor-pointer ${
              showComarcaNames
                ? 'bg-sky-500 text-white border-sky-700'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-sky-50'
            }`}
          >
            {showComarcaNames ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>🏷️ {showComarcaNames ? 'Amaga noms' : 'Mostra noms'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCapitalNames(v => !v)}
            className={`kid-btn px-3.5 py-2 font-extrabold text-xs sm:text-sm flex items-center gap-2 cursor-pointer ${
              showCapitalNames
                ? 'bg-rose-500 text-white border-rose-700'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-rose-50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>📍 {showCapitalNames ? 'Amaga capitals' : 'Mostra capitals'}</span>
          </button>

          <button
            type="button"
            onClick={() => setColorMode(m => (m === 'pastel' ? 'explorades' : 'pastel'))}
            className={`kid-btn px-3.5 py-2 font-extrabold text-xs sm:text-sm flex items-center gap-2 cursor-pointer ${
              colorMode === 'explorades'
                ? 'bg-emerald-500 text-white border-emerald-700'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              ⭐ Explorades ({discoveredCodis.length}/{COMARQUES_DATA.length})
            </span>
          </button>

          <button
            type="button"
            onClick={handleRandomComarca}
            className="kid-btn px-3.5 py-2 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 bg-amber-300 hover:bg-amber-200 text-amber-950 border-amber-500 cursor-pointer"
            title="Tria una comarca sorpresa a l'atzar!"
          >
            <Shuffle className="w-4 h-4" />
            <span>🎲 Comarca sorpresa!</span>
          </button>

          <button
            type="button"
            onClick={handleResetGeneralView}
            className="kid-btn px-3.5 py-2 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 bg-violet-100 hover:bg-violet-200 text-violet-950 border-violet-300 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>🗺️ Vista general</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Interactive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Directory List */}
        <div className="lg:col-span-3 kid-card bg-white border-sky-300 flex flex-col h-[340px] lg:h-[670px] overflow-hidden">
          <div className="p-3 bg-gradient-to-r from-sky-100 to-cyan-100 border-b-2 border-sky-200 flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-sky-900">
              📋 Totes les comarques ({filteredComarques.length})
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white text-[11px] font-extrabold text-sky-700 border border-sky-200">
              42 + l’Aran
            </span>
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 p-2 space-y-1">
            {filteredComarques.length === 0 ? (
              <div className="p-6 text-center text-sm font-bold text-slate-500">
                🙈 No hem trobat cap comarca amb «{searchQuery}».
              </div>
            ) : (
              filteredComarques.map(com => {
                const isSelected = selectedComarca?.codi === com.codi;
                const isVisited = discoveredCodis.includes(com.codi);
                const pMeta = PAISATGE_META[com.didactic.paisatgePrincipal];
                return (
                  <button
                    key={com.codi}
                    type="button"
                    onClick={() => handleSelectComarca(com, true)}
                    className={`w-full text-left px-3 py-2 rounded-2xl transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-200 border-3 border-amber-500 text-slate-950 font-extrabold shadow-xs scale-[1.01]'
                        : 'hover:bg-sky-50 text-slate-700 border-2 border-transparent'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 border border-white shadow-2xs"
                          style={{ backgroundColor: pMeta.colorHex }}
                          title={`Paisatge de ${com.didactic.paisatgePrincipal}`}
                        />
                        <p className="text-sm font-extrabold truncate">{com.nom}</p>
                        {(com.codi === '43' || com.codi === '39') && (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-300 text-amber-950 text-[10px] font-black">
                            {com.codi === '43' ? '✨ Nova!' : '🏔️ Aran'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-semibold truncate pl-4">
                        📍 {com.capital}
                      </p>
                    </div>
                    {isVisited && <span className="text-sm shrink-0">⭐</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Center Interactive Map */}
        <div className="lg:col-span-5 h-[500px] lg:h-[670px]">
          <CataloniaMap
            selectedCodi={selectedComarca?.codi}
            onSelectComarca={c => handleSelectComarca(c, false)}
            getComarcaFill={getComarcaFill}
            showComarcaNames={showComarcaNames}
            showCapitalNames={showCapitalNames}
            externalFocusBBox={focusBBox}
            legendSlot={
              <div className="bg-white/95 backdrop-blur-sm px-3.5 py-2 rounded-2xl border-3 border-amber-400 shadow-md text-xs space-y-0.5">
                <p className="font-extrabold text-amber-900">
                  🕵️‍♂️ Pista d’explorador/a:
                </p>
                <p className="text-slate-700 font-medium">
                  Toca qualsevol comarca per obrir el seu passaport!
                </p>
              </div>
            }
          />
        </div>

        {/* Right Pedagogical Detail Card */}
        <div className="lg:col-span-4 h-auto lg:h-[670px]">
          <ComarcaDetailCard
            comarca={selectedComarca}
            isDiscovered={discoveredCodis.includes(selectedComarca.codi)}
            onToggleDiscovered={onToggleDiscovered}
            onZoomToComarca={c => setFocusBBox({ ...c.bbox })}
          />
        </div>
      </div>
    </div>
  );
};
