import React, { useState, useEffect } from 'react';
import { ComarcaFeature } from '../utils/cartography';
import { PAISATGE_META } from '../data/comarquesInfo';
import {
  Volume2,
  VolumeX,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';

interface ComarcaDetailCardProps {
  comarca: ComarcaFeature;
  isDiscovered?: boolean;
  onToggleDiscovered?: (codi: string) => void;
  highlightLandscape?: boolean;
  highlightProvince?: boolean;
  onZoomToComarca?: (comarca: ComarcaFeature) => void;
}

export const ComarcaDetailCard: React.FC<ComarcaDetailCardProps> = ({
  comarca,
  isDiscovered = false,
  onToggleDiscovered,
  highlightLandscape = false,
  highlightProvince = false,
  onZoomToComarca,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { didactic } = comarca;
  const paisatgeMeta = PAISATGE_META[didactic.paisatgePrincipal];

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [comarca.codi]);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const text = `${comarca.nom}. Capital: ${comarca.capital}. ${didactic.localitzacioText} ${didactic.resumPaisatge} Relleu: ${didactic.relleuText} Activitats humanes: ${didactic.activitatsHumanes} Sabies que: ${didactic.curiositat}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ca-ES';
    utterance.rate = 0.96;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const paisatgeEmoji =
    didactic.paisatgePrincipal === 'muntanya'
      ? '🏔️'
      : didactic.paisatgePrincipal === 'plana'
      ? '🌾'
      : '🏖️';

  return (
    <div className="kid-card bg-white border-amber-400 overflow-hidden flex flex-col h-full">
      {/* Header Banner */}
      <div
        className="p-4 sm:p-5 text-white relative border-b-4 border-amber-400"
        style={{
          background: `linear-gradient(135deg, ${paisatgeMeta.colorHex}, ${paisatgeMeta.colorBorderHex})`,
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-white/25 backdrop-blur-sm text-white border border-white/40">
                🗺️ Comarca #{comarca.codi}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-white text-slate-900 shadow-2xs">
                {paisatgeEmoji} {didactic.paisatgePrincipal.toUpperCase()}
              </span>
              {didactic.esMixt && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-300 text-amber-950 border border-amber-500 flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Paisatge mixt
                </span>
              )}
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight drop-shadow-xs">
              {comarca.nom}
            </h3>
            <p className="mt-1.5 inline-flex items-center gap-1.5 bg-black/25 px-3 py-1 rounded-xl text-white font-bold text-sm sm:text-base">
              <span>📍 Capital:</span>
              <strong className="text-amber-300 underline decoration-amber-300/80">
                {comarca.capital}
              </strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
            {'speechSynthesis' in window && (
              <button
                type="button"
                onClick={handleSpeak}
                className={`kid-btn px-3 py-2 rounded-2xl font-extrabold text-xs flex items-center gap-1.5 cursor-pointer ${
                  isSpeaking
                    ? 'bg-amber-300 text-slate-950 border-slate-900 animate-bounce'
                    : 'bg-white text-slate-900 border-slate-800 hover:bg-amber-100'
                }`}
                title="Escolta la fitxa en veu alta"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-sky-600" />}
                <span>{isSpeaking ? 'Atura' : '🔊 Escolta'}</span>
              </button>
            )}
            {onToggleDiscovered && (
              <button
                type="button"
                onClick={() => onToggleDiscovered(comarca.codi)}
                className={`kid-btn px-3 py-2 rounded-2xl font-extrabold text-xs flex items-center gap-1.5 cursor-pointer ${
                  isDiscovered
                    ? 'bg-emerald-400 text-emerald-950 border-emerald-900'
                    : 'bg-amber-300 hover:bg-amber-200 text-amber-950 border-amber-700'
                }`}
                title="Marca la comarca al teu passaport d'explorador!"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isDiscovered ? '⭐ Explorada!' : '☆ Explora'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 bg-gradient-to-b from-white to-amber-50/30">
        {/* Special Territorial Status Notice (Aran / Lluçanès) */}
        {didactic.estatutEspecial && (
          <div className="p-3.5 rounded-2xl bg-amber-100 border-3 border-amber-400 text-amber-950 text-sm flex items-start gap-2.5 shadow-2xs">
            <span className="text-2xl shrink-0">🌟</span>
            <div>
              <p className="font-extrabold text-amber-900">Territori molt especial!</p>
              <p className="mt-0.5 leading-relaxed font-medium">{didactic.estatutEspecial}</p>
            </div>
          </div>
        )}

        {/* Official Stats Grid with Kid-Friendly Stickers */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-2.5 text-center shadow-2xs">
            <div className="text-sky-800 text-xs font-extrabold">
              👨‍👩‍👧‍👦 Habitants
            </div>
            <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
              {comarca.poblacio.toLocaleString('ca-ES')}
            </p>
            <p className="text-[10px] font-bold text-sky-700">persones</p>
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-2.5 text-center shadow-2xs">
            <div className="text-emerald-800 text-xs font-extrabold">
              📏 Superfície
            </div>
            <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
              {comarca.superficieKm2.toLocaleString('ca-ES')}
            </p>
            <p className="text-[10px] font-bold text-emerald-700">km² de terra</p>
          </div>

          <div className="bg-violet-50 border-2 border-violet-300 rounded-2xl p-2.5 text-center shadow-2xs">
            <div className="text-violet-800 text-xs font-extrabold">
              🏘️ Municipis
            </div>
            <p className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
              {comarca.municipis}
            </p>
            <p className="text-[10px] font-bold text-violet-700">pobles i ciutats</p>
          </div>
        </div>

        {/* Location & Province Info */}
        <div
          className={`p-3.5 rounded-2xl border-2 ${
            highlightProvince
              ? 'bg-indigo-50 border-indigo-400'
              : 'bg-sky-50/60 border-sky-200'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
              <span>🧭 On és al mapa?</span>
            </h4>
            {onZoomToComarca && (
              <button
                type="button"
                onClick={() => onZoomToComarca(comarca)}
                className="px-2.5 py-0.5 rounded-full bg-sky-200 hover:bg-sky-300 text-xs font-extrabold text-sky-950 cursor-pointer"
              >
                🔍 Apropa-hi el mapa!
              </button>
            )}
          </div>
          <p className="text-sm font-medium text-slate-700 leading-relaxed">
            {didactic.localitzacioText}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
            <span className="px-2.5 py-1 rounded-xl bg-white border-2 border-sky-200 font-bold text-slate-700">
              🏛️ Província:{' '}
              <strong className="text-slate-900">
                {comarca.provincies.map(p => `${p.nom} (${p.municipis})`).join(' + ')}
              </strong>
            </span>
          </div>
        </div>

        {/* Landscape & Relief Explanation */}
        <div
          className={`p-3.5 rounded-2xl border-2 ${
            highlightLandscape
              ? 'bg-emerald-50 border-emerald-400'
              : 'bg-emerald-50/50 border-emerald-200'
          } space-y-2`}
        >
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
            <span>🏞️ Com és el seu paisatge i relleu?</span>
          </h4>
          <p className="text-sm font-bold text-slate-800 leading-relaxed">
            {didactic.resumPaisatge}
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            <strong className="text-emerald-950">⛰️ Relleu:</strong> {didactic.relleuText}
          </p>
          {didactic.esMixt && didactic.explicacioMixt && (
            <div className="p-2.5 rounded-xl bg-amber-100 border-2 border-amber-300 text-xs text-amber-950 font-medium">
              <strong>🎨 Paisatge mixt:</strong> {didactic.explicacioMixt}
            </div>
          )}
          <p className="text-sm text-slate-700 leading-relaxed">
            <strong className="text-emerald-950">👩‍🌾 Què hi fa la gent?</strong>{' '}
            {didactic.activitatsHumanes}
          </p>
        </div>

        {/* Curiosity & Highlights */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 border-3 border-amber-400 space-y-2 shadow-2xs">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>💡 Sabies que...? (Curiositat!)</span>
          </h4>
          <p className="text-sm font-semibold text-slate-900 leading-relaxed">
            {didactic.curiositat}
          </p>
          <div className="pt-1 flex flex-wrap gap-1.5">
            {didactic.elementsDestacats.map(item => (
              <span
                key={item}
                className="px-3 py-1 rounded-full bg-white border-2 border-amber-400 text-xs font-extrabold text-amber-950 shadow-2xs"
              >
                ⭐ {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
