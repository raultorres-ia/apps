import React, { useState, useMemo } from 'react';
import {
  COMARQUES_DATA,
  PROVINCIES_DATA,
  ComarcaFeature,
} from '../utils/cartography';
import {
  PROVINCIES_INFO,
  COMARQUES_MULTIPROVINCIALS,
} from '../data/comarquesInfo';
import { CataloniaMap } from './CataloniaMap';
import { ComarcaDetailCard } from './ComarcaDetailCard';
import {
  Layers,
  MapPin,
  Columns2,
  Eye,
  Map,
} from 'lucide-react';

interface ProvincesSectionProps {
  discoveredCodis: string[];
  onToggleDiscovered: (codi: string) => void;
  onMarkDiscovered: (codi: string) => void;
}

const NOM_TO_CODIPROV: Record<string, string> = {
  Barcelona: '08',
  Girona: '17',
  Lleida: '25',
  Tarragona: '43',
};

export const ProvincesSection: React.FC<ProvincesSectionProps> = ({
  discoveredCodis,
  onToggleDiscovered,
  onMarkDiscovered,
}) => {
  const [selectedProvCodi, setSelectedProvCodi] = useState<string | null>(null);
  const [selectedComarca, setSelectedComarca] = useState<ComarcaFeature>(() => {
    return COMARQUES_DATA.find(c => c.codi === '15') || COMARQUES_DATA[0];
  });
  const [showComarcaBorders, setShowComarcaBorders] = useState<boolean>(true);
  const [showProvinciaBorders, setShowProvinciaBorders] = useState<boolean>(true);
  const [showProvinciaCapitals, setShowProvinciaCapitals] = useState<boolean>(true);
  const [showComarcaNames, setShowComarcaNames] = useState<boolean>(false);
  const [compareSideBySide, setCompareSideBySide] = useState<boolean>(false);

  const selectedProvincia = useMemo(
    () => PROVINCIES_DATA.find(p => p.codi === selectedProvCodi) || null,
    [selectedProvCodi]
  );

  const comarquesOfSelectedProv = useMemo(() => {
    if (!selectedProvincia) return COMARQUES_DATA;
    return COMARQUES_DATA.filter(c =>
      c.provincies.some(p => p.nom === selectedProvincia.nom)
    );
  }, [selectedProvincia]);

  const getComarcaFill = (comarca: ComarcaFeature): string => {
    const mainProvCodi = NOM_TO_CODIPROV[comarca.provinciaPrincipal] || '08';
    const provInfo = PROVINCIES_INFO[mainProvCodi];

    if (!selectedProvincia) {
      return provInfo.colorHex;
    }

    const belongsTotallyOrPartially = comarca.provincies.some(
      p => p.nom === selectedProvincia.nom
    );

    if (!belongsTotallyOrPartially) {
      return '#f1f5f9';
    }

    return PROVINCIES_INFO[selectedProvincia.codi].colorHex;
  };

  const getComarcaOpacity = (comarca: ComarcaFeature): number => {
    if (selectedComarca?.codi === comarca.codi) return 1;
    if (!selectedProvincia) return 0.86;
    const share = comarca.provincies.find(p => p.nom === selectedProvincia.nom);
    if (!share) return 0.3;
    return comarca.provinciaPrincipal === selectedProvincia.nom ? 0.92 : 0.65;
  };

  const handleSelectComarca = (comarca: ComarcaFeature) => {
    setSelectedComarca(comarca);
    onMarkDiscovered(comarca.codi);
  };

  return (
    <div className="space-y-6">
      {/* Top Province Selector & Layer Controls */}
      <div className="kid-card bg-white border-violet-400 p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              🏛️ Les 4 províncies de Catalunya!
            </h2>
            <p className="text-sm font-semibold text-slate-600">
              Descobreix Barcelona, Girona, Lleida i Tarragona, compara-les amb les comarques i troba les 4 comarques compartides!
            </p>
          </div>

          {/* Playful 3D Layer & Comparison Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowComarcaBorders(v => !v)}
              className={`kid-btn px-3 py-2 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer ${
                showComarcaBorders
                  ? 'bg-sky-500 text-white border-sky-700'
                  : 'bg-white text-slate-600 border-slate-300'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>🧩 Límits comarques: {showComarcaBorders ? 'SÍ' : 'NO'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowProvinciaBorders(v => !v)}
              className={`kid-btn px-3 py-2 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer ${
                showProvinciaBorders
                  ? 'bg-violet-600 text-white border-violet-800'
                  : 'bg-white text-slate-600 border-slate-300'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>🏛️ Límits províncies: {showProvinciaBorders ? 'SÍ' : 'NO'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowProvinciaCapitals(v => !v)}
              className={`kid-btn px-3 py-2 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer ${
                showProvinciaCapitals
                  ? 'bg-amber-400 text-slate-950 border-amber-600'
                  : 'bg-white text-slate-600 border-slate-300'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>⭐ Capitals provincials</span>
            </button>

            <button
              type="button"
              onClick={() => setShowComarcaNames(v => !v)}
              className={`kid-btn px-3 py-2 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer ${
                showComarcaNames
                  ? 'bg-rose-500 text-white border-rose-700'
                  : 'bg-white text-slate-600 border-slate-300'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>🏷️ Noms comarques</span>
            </button>

            <button
              type="button"
              onClick={() => setCompareSideBySide(v => !v)}
              className={`kid-btn px-3.5 py-2 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer ${
                compareSideBySide
                  ? 'bg-emerald-500 text-white border-emerald-700'
                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border-emerald-400'
              }`}
            >
              <Columns2 className="w-4 h-4" />
              <span>👀 {compareSideBySide ? 'Tanca doble mapa' : 'Compara 2 mapes alhora!'}</span>
            </button>
          </div>
        </div>

        {/* 4 Province Cards + All */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            type="button"
            onClick={() => setSelectedProvCodi(null)}
            className={`kid-btn p-3 text-left cursor-pointer ${
              selectedProvCodi === null
                ? 'bg-violet-600 text-white border-violet-900'
                : 'bg-violet-50 hover:bg-violet-100 text-violet-950 border-violet-300'
            }`}
          >
            <p className="font-extrabold text-sm">🗺️ Totes 4 províncies</p>
            <p className="text-xs opacity-85">947 pobles i ciutats</p>
          </button>

          {PROVINCIES_DATA.map(prov => {
            const isSel = selectedProvCodi === prov.codi;
            const comCount = COMARQUES_DATA.filter(c =>
              c.provincies.some(p => p.nom === prov.nom)
            ).length;
            return (
              <button
                key={prov.codi}
                type="button"
                onClick={() => setSelectedProvCodi(isSel ? null : prov.codi)}
                className="kid-btn p-3 text-left flex items-center gap-2.5 cursor-pointer"
                style={{
                  backgroundColor: isSel ? prov.didactic.colorHex : prov.didactic.colorLightHex,
                  borderColor: isSel ? prov.didactic.colorBorderHex : prov.didactic.colorHex,
                  color: isSel ? '#ffffff' : prov.didactic.colorBorderHex,
                }}
              >
                <span
                  className="w-5 h-5 rounded-full shrink-0 border-2 border-white shadow-2xs"
                  style={{ backgroundColor: prov.didactic.colorHex }}
                />
                <div className="min-w-0">
                  <p className="font-extrabold text-sm truncate">{prov.nom}</p>
                  <p className="text-[11px] font-bold opacity-90 truncate">
                    ⭐ {prov.capital} · {comCount} com.
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Side-by-Side Comparison Banner */}
      {compareSideBySide ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="kid-card bg-white border-violet-400 p-3.5 space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-extrabold text-base text-slate-900">
                🏛️ 1. Mapa de les 4 Províncies
              </h3>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-900 border border-violet-300">
                4 peces grans
              </span>
            </div>
            <div className="h-[460px]">
              <CataloniaMap
                onlyProvinciaBase
                highlightedProvinciaCodi={selectedProvCodi}
                onSelectProvincia={codi =>
                  setSelectedProvCodi(prev => (prev === codi ? null : codi))
                }
                showProvinciaBorders
                showProvinciaCapitals
              />
            </div>
          </div>

          <div className="kid-card bg-white border-amber-400 p-3.5 space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-extrabold text-base text-slate-900">
                🧩 2. Mapa de les 42 Comarques + l’Aran
              </h3>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                43 peces comarcals
              </span>
            </div>
            <div className="h-[460px]">
              <CataloniaMap
                selectedCodi={selectedComarca?.codi}
                onSelectComarca={handleSelectComarca}
                getComarcaFill={getComarcaFill}
                getComarcaOpacity={getComarcaOpacity}
                getComarcaStroke={() => '#ffffff'}
                showComarcaBorders
                showProvinciaBorders
                showProvinciaCapitals={showProvinciaCapitals}
                showComarcaNames={showComarcaNames}
                highlightedProvinciaCodi={selectedProvCodi}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-7 h-[520px] lg:h-[660px]">
            <CataloniaMap
              selectedCodi={selectedComarca?.codi}
              onSelectComarca={handleSelectComarca}
              getComarcaFill={getComarcaFill}
              getComarcaOpacity={getComarcaOpacity}
              getComarcaStroke={() => '#ffffff'}
              showComarcaBorders={showComarcaBorders}
              showProvinciaBorders={showProvinciaBorders}
              showProvinciaCapitals={showProvinciaCapitals}
              showComarcaNames={showComarcaNames}
              highlightedProvinciaCodi={selectedProvCodi}
              onlyProvinciaBase={!showComarcaBorders && showProvinciaBorders}
              onSelectProvincia={codi => setSelectedProvCodi(codi)}
              legendSlot={
                <div className="bg-white/95 backdrop-blur-sm p-3.5 rounded-2xl border-3 border-violet-400 shadow-md text-xs space-y-1.5">
                  <p className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px]">
                    🏛️ Colors de les Províncies
                  </p>
                  {PROVINCIES_DATA.map(p => (
                    <div key={p.codi} className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-md border border-slate-700"
                        style={{ backgroundColor: p.didactic.colorHex }}
                      />
                      <span className="font-bold text-slate-800">
                        {p.nom} (⭐ {p.capital})
                      </span>
                    </div>
                  ))}
                </div>
              }
            />
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4 h-auto lg:h-[660px] overflow-y-auto pr-0.5">
            {selectedProvincia && (
              <div
                className="kid-card p-4 space-y-2.5 shrink-0"
                style={{
                  backgroundColor: selectedProvincia.didactic.colorLightHex,
                  borderColor: selectedProvincia.didactic.colorHex,
                }}
              >
                <div className="flex items-center justify-between">
                  <h3
                    className="text-lg font-extrabold"
                    style={{ color: selectedProvincia.didactic.colorBorderHex }}
                  >
                    🏛️ Província de {selectedProvincia.nom}
                  </h3>
                  <span className="px-3 py-0.5 rounded-full bg-white text-xs font-extrabold text-slate-800 border-2 border-slate-300">
                    ⭐ Capital: {selectedProvincia.capital}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                  {selectedProvincia.didactic.descripcio}
                </p>
                <div className="pt-1">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                    Comarques de {selectedProvincia.nom} ({comarquesOfSelectedProv.length}):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {comarquesOfSelectedProv.map(c => {
                      const isCurrent = selectedComarca?.codi === c.codi;
                      return (
                        <button
                          key={c.codi}
                          type="button"
                          onClick={() => handleSelectComarca(c)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer border-2 ${
                            isCurrent
                              ? 'bg-amber-300 text-slate-950 border-slate-900'
                              : 'bg-white hover:bg-amber-50 text-slate-800 border-slate-300'
                          }`}
                        >
                          {c.nom}
                          {c.esMultiprovincial ? ' 🌟' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1">
              <ComarcaDetailCard
                comarca={selectedComarca}
                isDiscovered={discoveredCodis.includes(selectedComarca.codi)}
                onToggleDiscovered={onToggleDiscovered}
                highlightProvince
              />
            </div>
          </div>
        </div>
      )}

      {/* Pedagogical Explanation: Municipi -> Comarca -> Província */}
      <div className="kid-card bg-white border-sky-400 p-5 space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
            🏠 ➡️ 🧩 ➡️ 🏛️ Què és un municipi, una comarca i una província?
          </h3>
          <p className="text-sm font-semibold text-slate-600">
            Imagina-t’ho com nines russes o peces d’un trencaclosques que van de més petit a més gran!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-3xl bg-sky-50 border-3 border-sky-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-sky-500 text-white text-xs font-extrabold">
                1️⃣ El més petit i proper
              </span>
              <span className="text-3xl">🏘️</span>
            </div>
            <h4 className="text-lg font-extrabold text-sky-950">El Municipi</h4>
            <p className="text-sm font-medium text-slate-700 leading-relaxed">
              És el <strong>poble o la ciutat</strong> on vivim, amb el seu propi <strong>Ajuntament</strong>, els seus parcs, carrers i escoles.
            </p>
            <div className="p-2.5 rounded-2xl bg-white border-2 border-sky-200 text-xs font-semibold text-slate-700">
              🎈 A Catalunya hi ha <strong>947 municipis</strong>!
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-emerald-50 border-3 border-emerald-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-extrabold">
                2️⃣ L’equip de pobles veïns
              </span>
              <span className="text-3xl">🧩</span>
            </div>
            <h4 className="text-lg font-extrabold text-emerald-950">La Comarca</h4>
            <p className="text-sm font-medium text-slate-700 leading-relaxed">
              És un grup de <strong>municipis veïns</strong> que comparteixen un mateix paisatge i s’ajuden al voltant d’una <strong>capital comarcal</strong>.
            </p>
            <div className="p-2.5 rounded-2xl bg-white border-2 border-emerald-200 text-xs font-semibold text-slate-700">
              🎈 Catalunya té <strong>42 comarques i l’Aran</strong>!
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-amber-50 border-3 border-amber-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-extrabold">
                3️⃣ La peça més gran
              </span>
              <span className="text-3xl">🏛️</span>
            </div>
            <h4 className="text-lg font-extrabold text-amber-950">La Província</h4>
            <p className="text-sm font-medium text-slate-700 leading-relaxed">
              És una divisió molt més gran que agrupa moltes comarques i centenars de municipis al voltant d’una gran ciutat.
            </p>
            <div className="p-2.5 rounded-2xl bg-white border-2 border-amber-200 text-xs font-semibold text-slate-700">
              🎈 Són <strong>4 províncies</strong>: Barcelona, Girona, Lleida i Tarragona!
            </div>
          </div>
        </div>
      </div>

      {/* Special Focus: The 4 Multi-provincial Comarques */}
      <div className="kid-card bg-gradient-to-br from-amber-50 via-white to-violet-50 border-amber-400 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-300 border-2 border-amber-500 flex items-center justify-center text-2xl shrink-0">
            🌟
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Curiositat d’explorador: Les 4 comarques repartides en dues províncies!
            </h3>
            <p className="text-sm font-semibold text-slate-600">
              Hi ha <strong>4 comarques</strong> que tenen pobles en dues províncies diferents! Toca-les per veure com la ratlla de la província les travessa pel mig!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {COMARQUES_MULTIPROVINCIALS.map(item => {
            const comObj = COMARQUES_DATA.find(c => c.codi === item.codi);
            const isSelected = selectedComarca?.codi === item.codi;
            return (
              <div
                key={item.codi}
                onClick={() => comObj && handleSelectComarca(comObj)}
                className={`p-4 rounded-3xl border-3 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-amber-200 border-amber-600 shadow-md scale-[1.01]'
                    : 'bg-white hover:border-violet-400 border-amber-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-base text-slate-900">🧩 {item.nom}</h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-900 border border-violet-300 text-[11px] font-extrabold">
                      2 províncies!
                    </span>
                  </div>
                  <p className="text-xs font-extrabold text-violet-900">{item.resum}</p>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">{item.detall}</p>
                </div>

                <div className="space-y-1 pt-2 border-t border-amber-200">
                  {item.repartiment.map(rep => (
                    <div
                      key={rep.provincia}
                      className="text-[11px] bg-amber-50/80 px-2.5 py-1.5 rounded-xl border border-amber-200"
                    >
                      <span className="font-extrabold text-slate-900">
                        🏛️ {rep.provincia} ({rep.municipis}):
                      </span>{' '}
                      <span className="text-slate-700 font-medium">{rep.exemples}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
