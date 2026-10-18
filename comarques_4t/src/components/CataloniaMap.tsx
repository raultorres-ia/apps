import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  COMARQUES_DATA,
  PROVINCIES_DATA,
  ComarcaFeature,
  MAP_WIDTH,
  MAP_HEIGHT,
} from '../utils/cartography';
import { ZoomIn, ZoomOut, RotateCcw, Compass, Maximize2 } from 'lucide-react';

export interface MapViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CataloniaMapProps {
  selectedCodi?: string | null;
  hoveredCodi?: string | null;
  onSelectComarca?: (comarca: ComarcaFeature) => void;
  onHoverComarca?: (comarca: ComarcaFeature | null) => void;
  getComarcaFill?: (comarca: ComarcaFeature) => string;
  getComarcaStroke?: (comarca: ComarcaFeature) => string;
  getComarcaOpacity?: (comarca: ComarcaFeature) => number;
  showComarcaNames?: boolean;
  showCapitalNames?: boolean;
  showComarcaBorders?: boolean;
  showProvinciaBorders?: boolean;
  showProvinciaCapitals?: boolean;
  highlightedProvinciaCodi?: string | null;
  onSelectProvincia?: (codiProv: string) => void;
  onlyProvinciaBase?: boolean;
  customLabelsByCodi?: Record<string, { text: string; status?: 'correct' | 'wrong' | 'neutral' }>;
  highlightedTargetCodi?: string | null;
  onDropOnComarca?: (comarca: ComarcaFeature, droppedCodi: string) => void;
  externalFocusBBox?: { minX: number; minY: number; maxX: number; maxY: number } | null;
  showNeighborsContext?: boolean;
  showControls?: boolean;
  legendSlot?: React.ReactNode;
  className?: string;
}

const DEFAULT_VIEWBOX: MapViewBox = { x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT };

export const CataloniaMap: React.FC<CataloniaMapProps> = ({
  selectedCodi = null,
  hoveredCodi: externalHoveredCodi,
  onSelectComarca,
  onHoverComarca,
  getComarcaFill,
  getComarcaStroke,
  getComarcaOpacity,
  showComarcaNames = false,
  showCapitalNames = false,
  showComarcaBorders = true,
  showProvinciaBorders = false,
  showProvinciaCapitals = false,
  highlightedProvinciaCodi = null,
  onSelectProvincia,
  onlyProvinciaBase = false,
  customLabelsByCodi,
  highlightedTargetCodi = null,
  onDropOnComarca,
  externalFocusBBox = null,
  showNeighborsContext = true,
  showControls = true,
  legendSlot,
  className = '',
}) => {
  const [viewBox, setViewBox] = useState<MapViewBox>(DEFAULT_VIEWBOX);
  const [internalHoveredCodi, setInternalHoveredCodi] = useState<string | null>(null);
  const [dragOverCodi, setDragOverCodi] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ clientX: number; clientY: number; vbX: number; vbY: number } | null>(null);
  const didDragRef = useRef(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const activeHoveredCodi = externalHoveredCodi !== undefined ? externalHoveredCodi : internalHoveredCodi;
  const zoomFactor = MAP_WIDTH / viewBox.w;

  useEffect(() => {
    if (!externalFocusBBox) {
      setViewBox(DEFAULT_VIEWBOX);
      return;
    }
    const { minX, minY, maxX, maxY } = externalFocusBBox;
    const bw = Math.max(maxX - minX, 90);
    const bh = Math.max(maxY - minY, 90);
    const pad = Math.max(bw, bh) * 0.38;
    let w = bw + pad * 2;
    let h = bh + pad * 2;
    const aspect = MAP_WIDTH / MAP_HEIGHT;
    if (w / h > aspect) {
      h = w / aspect;
    } else {
      w = h * aspect;
    }
    w = Math.min(MAP_WIDTH, Math.max(160, w));
    h = Math.min(MAP_HEIGHT, Math.max(152, h));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const x = Math.max(-60, Math.min(MAP_WIDTH - w + 60, cx - w / 2));
    const y = Math.max(-60, Math.min(MAP_HEIGHT - h + 60, cy - h / 2));
    setViewBox({ x, y, w, h });
  }, [externalFocusBBox]);

  const handleZoom = useCallback((factor: number) => {
    setViewBox(prev => {
      const newW = Math.min(MAP_WIDTH, Math.max(150, prev.w * factor));
      const newH = Math.min(MAP_HEIGHT, Math.max(143, prev.h * factor));
      const cx = prev.x + prev.w / 2;
      const cy = prev.y + prev.h / 2;
      const newX = Math.max(-80, Math.min(MAP_WIDTH - newW + 80, cx - newW / 2));
      const newY = Math.max(-80, Math.min(MAP_HEIGHT - newH + 80, cy - newH / 2));
      return { x: newX, y: newY, w: newW, h: newH };
    });
  }, []);

  const handleResetView = useCallback(() => {
    setViewBox(DEFAULT_VIEWBOX);
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 0.82 : 1.22;
      handleZoom(factor);
    },
    [handleZoom]
  );

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    setIsPanning(true);
    didDragRef.current = false;
    panStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      vbX: viewBox.x,
      vbY: viewBox.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isPanning || !panStartRef.current || !svgRef.current) return;
    const dxPx = e.clientX - panStartRef.current.clientX;
    const dyPx = e.clientY - panStartRef.current.clientY;
    if (Math.abs(dxPx) > 5 || Math.abs(dyPx) > 5) {
      didDragRef.current = true;
    }
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = viewBox.w / rect.width;
    const scaleY = viewBox.h / rect.height;
    const newX = Math.max(-120, Math.min(MAP_WIDTH - viewBox.w + 120, panStartRef.current.vbX - dxPx * scaleX));
    const newY = Math.max(-120, Math.min(MAP_HEIGHT - viewBox.h + 120, panStartRef.current.vbY - dyPx * scaleY));
    setViewBox(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handlePointerUp = () => {
    setIsPanning(false);
    panStartRef.current = null;
  };

  const zoomToSelected = () => {
    if (!selectedCodi) return;
    const com = COMARQUES_DATA.find(c => c.codi === selectedCodi);
    if (!com) return;
    const { minX, minY, maxX, maxY } = com.bbox;
    const bw = Math.max(maxX - minX, 85);
    const bh = Math.max(maxY - minY, 85);
    const pad = Math.max(bw, bh) * 0.65;
    let w = bw + pad * 2;
    let h = bh + pad * 2;
    const aspect = MAP_WIDTH / MAP_HEIGHT;
    if (w / h > aspect) h = w / aspect;
    else w = h * aspect;
    w = Math.min(MAP_WIDTH, Math.max(180, w));
    h = Math.min(MAP_HEIGHT, Math.max(172, h));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    setViewBox({
      x: cx - w / 2,
      y: cy - h / 2,
      w,
      h,
    });
  };

  const labelFontSize = Math.max(4.8, Math.min(10.8, 9.8 / Math.pow(zoomFactor, 0.55)));
  const capitalFontSize = Math.max(4.2, Math.min(9.2, 8.4 / Math.pow(zoomFactor, 0.55)));
  const pinRadius = Math.max(1.9, Math.min(4.0, 3.5 / Math.pow(zoomFactor, 0.5)));

  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded-3xl border-4 border-sky-400 bg-gradient-to-br from-sky-200 via-cyan-100 to-sky-200 shadow-[0_8px_0_0_rgba(14,116,144,0.2)] select-none ${className}`}
    >
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        className={`w-full h-full transition-transform duration-75 ${
          isPanning ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        role="img"
        aria-label="Mapa interactiu oficial de les comarques de Catalunya"
      >
        <defs>
          <filter id="cat-shadow" x="-5%" y="-5%" width="112%" height="112%">
            <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#0369a1" floodOpacity="0.25" />
          </filter>
          <filter id="selected-glow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.95" />
          </filter>
        </defs>

        {/* Playful Illustrated Sea Waves & Neighbor Context */}
        {showNeighborsContext && (
          <g className="pointer-events-none select-none">
            {/* Decorative sea waves */}
            <path
              d="M 540 720 Q 555 710 570 720 T 600 720 T 630 720"
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.35"
            />
            <path
              d="M 730 480 Q 745 470 760 480 T 790 480 T 820 480"
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.35"
            />
            <path
              d="M 420 800 Q 435 790 450 800 T 480 800"
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.35"
            />
            <text x="770" y="545" fontSize="26" opacity="0.75">
              ⛵
            </text>
            <text x="515" y="765" fontSize="22" opacity="0.7">
              🐬
            </text>

            <text
              x="675"
              y="635"
              transform="rotate(-38 675 635)"
              fill="#0369a1"
              opacity="0.55"
              fontSize="21"
              fontWeight="800"
              letterSpacing="5"
              textAnchor="middle"
            >
              🌊 MAR MEDITERRANI 🌊
            </text>
            <text x="510" y="34" fill="#334155" opacity="0.8" fontSize="13.5" fontWeight="800" letterSpacing="2">
              🏔️ FRANÇA
            </text>
            <text x="350" y="64" fill="#1e293b" opacity="0.9" fontSize="11.5" fontWeight="800" letterSpacing="1">
              ⛰️ ANDORRA
            </text>
            <text
              x="38"
              y="430"
              transform="rotate(-90 38 430)"
              fill="#334155"
              opacity="0.8"
              fontSize="13.5"
              fontWeight="800"
              letterSpacing="2"
              textAnchor="middle"
            >
              🌾 ARAGÓ
            </text>
            <text x="70" y="840" fill="#334155" opacity="0.8" fontSize="12.5" fontWeight="800" letterSpacing="1.5">
              🍊 PAÍS VALENCIÀ
            </text>
          </g>
        )}

        {/* Base shadow under Catalonia */}
        <g filter="url(#cat-shadow)">
          {PROVINCIES_DATA.map(prov => (
            <path key={`shadow-${prov.codi}`} d={prov.svgPath} fill="#fffbeb" stroke="none" />
          ))}
        </g>

        {/* Optional Provincial Base Layer */}
        {onlyProvinciaBase &&
          PROVINCIES_DATA.map(prov => {
            const isSelectedProv = highlightedProvinciaCodi === prov.codi;
            const fill =
              highlightedProvinciaCodi && !isSelectedProv
                ? prov.didactic.colorLightHex
                : prov.didactic.colorHex;
            return (
              <path
                key={`prov-base-${prov.codi}`}
                d={prov.svgPath}
                fill={fill}
                fillOpacity={highlightedProvinciaCodi && !isSelectedProv ? 0.55 : 0.88}
                stroke={prov.didactic.colorBorderHex}
                strokeWidth={isSelectedProv ? 3.2 / Math.sqrt(zoomFactor) : 2 / Math.sqrt(zoomFactor)}
                className="transition-colors duration-200 cursor-pointer hover:opacity-95"
                onClick={e => {
                  e.stopPropagation();
                  if (didDragRef.current) return;
                  onSelectProvincia?.(prov.codi);
                }}
              />
            );
          })}

        {/* Main 43 Comarques Layer */}
        {!onlyProvinciaBase && (
          <g>
            {COMARQUES_DATA.map(comarca => {
              const isSelected = selectedCodi === comarca.codi;
              const isHovered = activeHoveredCodi === comarca.codi;
              const isTarget = highlightedTargetCodi === comarca.codi;
              const isDragOver = dragOverCodi === comarca.codi;

              const defaultFill = isSelected
                ? '#fbbf24'
                : isTarget
                ? '#fde047'
                : isHovered || isDragOver
                ? '#7dd3fc'
                : '#ffffff';

              const fill = getComarcaFill ? getComarcaFill(comarca) : defaultFill;
              const opacity = getComarcaOpacity ? getComarcaOpacity(comarca) : 1;
              const stroke = getComarcaStroke
                ? getComarcaStroke(comarca)
                : showComarcaBorders
                ? isSelected
                  ? '#9a3412'
                  : isHovered || isDragOver
                  ? '#0284c7'
                  : '#334155'
                : 'transparent';

              const strokeWidth = showComarcaBorders
                ? (isSelected ? 2.8 : isTarget ? 2.6 : isHovered || isDragOver ? 2.0 : 1.0) /
                  Math.pow(zoomFactor, 0.65)
                : 0;

              return (
                <path
                  key={comarca.codi}
                  d={comarca.svgPath}
                  fill={isDragOver ? '#fde047' : fill}
                  fillOpacity={opacity}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  className="transition-colors duration-150 cursor-pointer outline-none"
                  onClick={e => {
                    e.stopPropagation();
                    if (didDragRef.current) return;
                    onSelectComarca?.(comarca);
                  }}
                  onMouseEnter={() => {
                    setInternalHoveredCodi(comarca.codi);
                    onHoverComarca?.(comarca);
                  }}
                  onMouseLeave={() => {
                    setInternalHoveredCodi(null);
                    onHoverComarca?.(null);
                  }}
                  onDragOver={e => {
                    if (!onDropOnComarca) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverCodi !== comarca.codi) setDragOverCodi(comarca.codi);
                  }}
                  onDragLeave={() => {
                    if (dragOverCodi === comarca.codi) setDragOverCodi(null);
                  }}
                  onDrop={e => {
                    if (!onDropOnComarca) return;
                    e.preventDefault();
                    setDragOverCodi(null);
                    const droppedCodi = e.dataTransfer.getData('text/plain');
                    if (droppedCodi) {
                      onDropOnComarca(comarca, droppedCodi);
                    }
                  }}
                >
                  <title>{showComarcaNames ? `${comarca.nom} (${comarca.capital})` : 'Comarca de Catalunya'}</title>
                </path>
              );
            })}

            {/* Highlight Selected / Target Comarca on top */}
            {COMARQUES_DATA.filter(
              c =>
                c.codi === selectedCodi ||
                c.codi === highlightedTargetCodi ||
                c.codi === activeHoveredCodi ||
                c.codi === dragOverCodi
            ).map(comarca => {
              const isSelected = selectedCodi === comarca.codi;
              const isTarget = highlightedTargetCodi === comarca.codi;
              const isDragOver = dragOverCodi === comarca.codi;
              return (
                <path
                  key={`highlight-border-${comarca.codi}`}
                  d={comarca.svgPath}
                  fill="none"
                  stroke={
                    isSelected
                      ? '#7c2d12'
                      : isTarget
                      ? '#dc2626'
                      : isDragOver
                      ? '#d97706'
                      : '#0284c7'
                  }
                  strokeWidth={(isSelected || isTarget ? 3.0 : 2.2) / Math.pow(zoomFactor, 0.65)}
                  strokeLinejoin="round"
                  filter={isSelected ? 'url(#selected-glow)' : undefined}
                  className="pointer-events-none"
                />
              );
            })}
          </g>
        )}

        {/* Official Provincial Borders Overlay */}
        {showProvinciaBorders && (
          <g className="pointer-events-none">
            {PROVINCIES_DATA.map(prov => {
              const isHighlighted = highlightedProvinciaCodi === prov.codi;
              return (
                <path
                  key={`prov-border-${prov.codi}`}
                  d={prov.svgPath}
                  fill="none"
                  stroke={isHighlighted ? '#0f172a' : prov.didactic.colorBorderHex}
                  strokeWidth={(isHighlighted ? 3.8 : 2.5) / Math.pow(zoomFactor, 0.6)}
                  strokeDasharray={onlyProvinciaBase ? undefined : '6,3'}
                  strokeLinejoin="round"
                />
              );
            })}
          </g>
        )}

        {/* Comarca Capitals Layer */}
        {showCapitalNames && !onlyProvinciaBase && (
          <g className="pointer-events-none">
            {COMARQUES_DATA.map(comarca => {
              const isSelected = selectedCodi === comarca.codi;
              const isHovered = activeHoveredCodi === comarca.codi;
              const showLabel = zoomFactor >= 1.35 || isSelected || isHovered || comarca.superficieKm2 > 680;
              return comarca.capitals.map(cap => (
                <g key={`${comarca.codi}-${cap.nom}`}>
                  <circle
                    cx={cap.x}
                    cy={cap.y}
                    r={isSelected ? pinRadius * 1.4 : pinRadius}
                    fill={isSelected ? '#e11d48' : '#ef4444'}
                    stroke="#ffffff"
                    strokeWidth={1.3 / Math.pow(zoomFactor, 0.5)}
                  />
                  {showLabel && (
                    <text
                      x={cap.x}
                      y={cap.y - pinRadius - 2 / Math.pow(zoomFactor, 0.5)}
                      textAnchor="middle"
                      fontSize={capitalFontSize}
                      fontWeight={isSelected ? '800' : '700'}
                      fill="#0f172a"
                      style={{
                        paintOrder: 'stroke',
                        stroke: '#ffffff',
                        strokeWidth: `${2.6 / Math.pow(zoomFactor, 0.55)}px`,
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                      }}
                    >
                      {cap.nom}
                    </text>
                  )}
                </g>
              ));
            })}
          </g>
        )}

        {/* Provincial Capitals Layer */}
        {showProvinciaCapitals && (
          <g className="pointer-events-none">
            {PROVINCIES_DATA.map(prov => (
              <g key={`prov-cap-${prov.codi}`}>
                <circle
                  cx={prov.capitalPoint.x}
                  cy={prov.capitalPoint.y}
                  r={7 / Math.pow(zoomFactor, 0.5)}
                  fill={prov.didactic.colorHex}
                  stroke="#ffffff"
                  strokeWidth={2.2 / Math.pow(zoomFactor, 0.5)}
                />
                <circle
                  cx={prov.capitalPoint.x}
                  cy={prov.capitalPoint.y}
                  r={2.6 / Math.pow(zoomFactor, 0.5)}
                  fill="#ffffff"
                />
                <text
                  x={prov.capitalPoint.x}
                  y={prov.capitalPoint.y - 9.5 / Math.pow(zoomFactor, 0.5)}
                  textAnchor="middle"
                  fontSize={Math.max(7.5, 12.5 / Math.pow(zoomFactor, 0.5))}
                  fontWeight="800"
                  fill="#0f172a"
                  style={{
                    paintOrder: 'stroke',
                    stroke: '#ffffff',
                    strokeWidth: `${3.8 / Math.pow(zoomFactor, 0.5)}px`,
                  }}
                >
                  ⭐ {prov.capital}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* Comarca Names Layer */}
        {showComarcaNames && !onlyProvinciaBase && (
          <g className="pointer-events-none">
            {COMARQUES_DATA.map(comarca => {
              const isSelected = selectedCodi === comarca.codi;
              const isHovered = activeHoveredCodi === comarca.codi;
              const isTiny = comarca.superficieKm2 < 320;
              const fSize = isSelected
                ? labelFontSize * 1.18
                : isTiny
                ? labelFontSize * 0.85
                : labelFontSize;

              return (
                <text
                  key={`name-${comarca.codi}`}
                  x={comarca.centroid.x}
                  y={comarca.centroid.y + (showCapitalNames ? 5 / Math.pow(zoomFactor, 0.5) : 1.5)}
                  textAnchor="middle"
                  fontSize={fSize}
                  fontWeight={isSelected || isHovered ? '800' : '700'}
                  fill={isSelected ? '#7c2d12' : '#1e293b'}
                  style={{
                    paintOrder: 'stroke',
                    stroke: isSelected ? '#fef3c7' : '#ffffff',
                    strokeWidth: `${2.8 / Math.pow(zoomFactor, 0.55)}px`,
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                  }}
                >
                  {comarca.nom}
                </text>
              );
            })}
          </g>
        )}

        {/* Custom Quiz Labels Layer */}
        {customLabelsByCodi && (
          <g className="pointer-events-none">
            {Object.entries(customLabelsByCodi).map(([codi, item]) => {
              const com = COMARQUES_DATA.find(c => c.codi === codi);
              if (!com) return null;
              const strokeColor =
                item.status === 'correct'
                  ? '#dcfce7'
                  : item.status === 'wrong'
                  ? '#fee2e2'
                  : '#ffffff';
              const textColor =
                item.status === 'correct'
                  ? '#14532d'
                  : item.status === 'wrong'
                  ? '#7f1d1d'
                  : '#0f172a';
              return (
                <text
                  key={`custom-label-${codi}`}
                  x={com.centroid.x}
                  y={com.centroid.y + 2}
                  textAnchor="middle"
                  fontSize={labelFontSize * 1.06}
                  fontWeight="800"
                  fill={textColor}
                  style={{
                    paintOrder: 'stroke',
                    stroke: strokeColor,
                    strokeWidth: `${3.2 / Math.pow(zoomFactor, 0.55)}px`,
                    strokeLinejoin: 'round',
                  }}
                >
                  {item.text}
                </text>
              );
            })}
          </g>
        )}
      </svg>

      {/* Playful Kids Compass Rose (Rosa dels vents) */}
      <div
        className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm border-3 border-amber-400 rounded-2xl px-3 py-2 shadow-[0_4px_0_0_rgba(245,158,11,0.3)] flex items-center gap-2.5 pointer-events-none"
        title="Rosa dels vents: Orientació espacial"
      >
        <div className="relative w-10 h-10 flex items-center justify-center bg-amber-50 rounded-full border-2 border-amber-300">
          <Compass className="w-7 h-7 text-amber-600" />
          <span className="absolute -top-1.5 text-[10px] font-black text-rose-600 bg-white px-1 rounded-full">N</span>
          <span className="absolute -bottom-1.5 text-[9px] font-extrabold text-sky-700 bg-white px-1 rounded-full">S</span>
          <span className="absolute -left-1.5 text-[9px] font-extrabold text-emerald-700 bg-white px-0.5 rounded-full">O</span>
          <span className="absolute -right-1.5 text-[9px] font-extrabold text-violet-700 bg-white px-0.5 rounded-full">E</span>
        </div>
        <div className="hidden sm:block text-xs leading-tight">
          <p className="font-extrabold text-slate-800">🧭 Rosa dels vents</p>
          <p className="text-[11px] font-semibold text-amber-700">42 comarques + Aran</p>
        </div>
      </div>

      {/* Chunky 3D Game Map Controls */}
      {showControls && (
        <div className="absolute top-3 right-3 flex flex-col gap-2 bg-white/95 backdrop-blur-sm p-2 rounded-2xl border-3 border-sky-300 shadow-[0_5px_0_0_rgba(14,165,233,0.25)]">
          <button
            type="button"
            onClick={() => handleZoom(0.75)}
            className="kid-btn p-2 rounded-xl bg-sky-100 hover:bg-sky-200 border-sky-400 text-sky-900 flex items-center justify-center cursor-pointer"
            title="Apropa el mapa (Zoom +)"
            aria-label="Apropa el mapa"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(1.33)}
            className="kid-btn p-2 rounded-xl bg-sky-100 hover:bg-sky-200 border-sky-400 text-sky-900 flex items-center justify-center cursor-pointer"
            title="Allunya el mapa (Zoom -)"
            aria-label="Allunya el mapa"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          {selectedCodi && (
            <button
              type="button"
              onClick={zoomToSelected}
              className="kid-btn p-2 rounded-xl bg-amber-200 hover:bg-amber-300 border-amber-500 text-amber-950 flex items-center justify-center cursor-pointer"
              title="Apropa la comarca seleccionada"
              aria-label="Apropa la comarca seleccionada"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          )}
          <button
            type="button"
            onClick={handleResetView}
            className="kid-btn flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 border-emerald-400 text-emerald-950 font-extrabold text-xs cursor-pointer"
            title="Torna a veure tot el mapa de Catalunya"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tot el mapa</span>
          </button>
        </div>
      )}

      {/* Cheerful Hover Bubble at bottom-left */}
      {activeHoveredCodi && (
        <div className="absolute bottom-3 left-3 bg-amber-400 text-slate-950 border-3 border-slate-900 px-4 py-2 rounded-2xl text-sm font-extrabold shadow-[0_4px_0_0_rgba(15,23,42,0.9)] pointer-events-none flex items-center gap-2 animate-fadeIn">
          <span className="text-base">👆</span>
          {(() => {
            const c = COMARQUES_DATA.find(x => x.codi === activeHoveredCodi);
            if (!c) return null;
            return showComarcaNames || customLabelsByCodi === undefined ? (
              <span>
                <strong>{c.nom}</strong> · Capital: <span className="underline">{c.capital}</span>
              </span>
            ) : (
              <span>Fes clic aquí per triar aquesta comarca!</span>
            );
          })()}
        </div>
      )}

      {/* Optional Legend Slot at bottom-right */}
      {legendSlot && <div className="absolute bottom-3 right-3">{legendSlot}</div>}
    </div>
  );
};
