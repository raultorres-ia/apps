import comarquesGeoJson from '../data/icgc-comarques.geo.json';
import provinciesGeoJson from '../data/icgc-provincies.geo.json';
import {
  COMARQUES_INFO,
  ComarcaDidacticInfo,
  PROVINCIES_INFO,
  ProvinciaDidacticInfo,
} from '../data/comarquesInfo';

export interface CapitalPoint {
  nom: string;
  lon: number;
  lat: number;
  x: number;
  y: number;
  codiProv: string;
}

export interface ProvinciaShare {
  nom: string;
  municipis: number;
  exemplesMunicipis: string[];
}

export interface ComarcaFeature {
  codi: string;
  nom: string;
  capital: string;
  superficieKm2: number;
  poblacio: number;
  dataPoblacio: string;
  municipis: number;
  vegueria: string;
  provinciaPrincipal: string;
  provincies: ProvinciaShare[];
  esMultiprovincial: boolean;
  capitals: CapitalPoint[];
  svgPath: string;
  centroid: { x: number; y: number };
  bbox: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number };
  didactic: ComarcaDidacticInfo;
}

export interface ProvinciaFeature {
  codi: string;
  nom: string;
  capital: string;
  superficieKm2: number;
  svgPath: string;
  centroid: { x: number; y: number };
  capitalPoint: { x: number; y: number };
  bbox: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number };
  didactic: ProvinciaDidacticInfo;
}

// Official bounding box of Catalonia in WGS84 (from ICGC WFS)
// Lon: [0.15, 3.35], Lat: [40.51, 42.87]
const MIN_LON = 0.14;
const MAX_LON = 3.36;
const MIN_LAT = 40.50;
const MAX_LAT = 42.88;
const MEAN_LAT_RAD = ((MIN_LAT + MAX_LAT) / 2) * (Math.PI / 180);
const COS_LAT = Math.cos(MEAN_LAT_RAD); // ~0.74675 at 41.69° N

export const MAP_WIDTH = 900;
export const MAP_HEIGHT = 860;
const PADDING = 34;

const GEO_WIDTH = (MAX_LON - MIN_LON) * COS_LAT;
const GEO_HEIGHT = MAX_LAT - MIN_LAT;

const SCALE = Math.min(
  (MAP_WIDTH - PADDING * 2) / GEO_WIDTH,
  (MAP_HEIGHT - PADDING * 2) / GEO_HEIGHT
);

const OFFSET_X = (MAP_WIDTH - GEO_WIDTH * SCALE) / 2;
const OFFSET_Y = (MAP_HEIGHT - GEO_HEIGHT * SCALE) / 2;

export function projectLonLat(lon: number, lat: number): [number, number] {
  const x = OFFSET_X + (lon - MIN_LON) * COS_LAT * SCALE;
  const y = OFFSET_Y + (MAX_LAT - lat) * SCALE;
  return [Number(x.toFixed(2)), Number(y.toFixed(2))];
}

function ringToPath(ring: number[][]): {
  d: string;
  area: number;
  cx: number;
  cy: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  if (!ring || ring.length === 0) {
    return { d: '', area: 0, cx: 0, cy: 0, minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }
  const pts = ring.map(([lon, lat]) => projectLonLat(lon, lat));
  let d = `M${pts[0][0]},${pts[0][1]}`;
  let minX = pts[0][0];
  let minY = pts[0][1];
  let maxX = pts[0][0];
  let maxY = pts[0][1];

  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i];
    d += `L${x},${y}`;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  d += 'Z';

  // Shoelace formula for polygon area and area-weighted centroid
  let signedArea = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const cross = x0 * y1 - x1 * y0;
    signedArea += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  signedArea *= 0.5;
  const absArea = Math.abs(signedArea);
  if (absArea > 1e-5) {
    cx /= 6 * signedArea;
    cy /= 6 * signedArea;
  } else {
    cx = (minX + maxX) / 2;
    cy = (minY + maxY) / 2;
  }

  return { d, area: absArea, cx, cy, minX, minY, maxX, maxY };
}

function geometryToSvg(geometry: { type: string; coordinates: any }) {
  let d = '';
  let maxRingArea = -1;
  let bestCx = 0;
  let bestCy = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const polygons: number[][][][] =
    geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;

  for (const poly of polygons) {
    for (let rIdx = 0; rIdx < poly.length; rIdx++) {
      const ringRes = ringToPath(poly[rIdx]);
      if (!ringRes.d) continue;
      d += ringRes.d;
      if (ringRes.minX < minX) minX = ringRes.minX;
      if (ringRes.minY < minY) minY = ringRes.minY;
      if (ringRes.maxX > maxX) maxX = ringRes.maxX;
      if (ringRes.maxY > maxY) maxY = ringRes.maxY;
      if (rIdx === 0 && ringRes.area > maxRingArea) {
        maxRingArea = ringRes.area;
        bestCx = ringRes.cx;
        bestCy = ringRes.cy;
      }
    }
  }

  return {
    svgPath: d,
    centroid: { x: Number(bestCx.toFixed(1)), y: Number(bestCy.toFixed(1)) },
    bbox: {
      minX: Number(minX.toFixed(1)),
      minY: Number(minY.toFixed(1)),
      maxX: Number(maxX.toFixed(1)),
      maxY: Number(maxY.toFixed(1)),
      width: Number((maxX - minX).toFixed(1)),
      height: Number((maxY - minY).toFixed(1)),
    },
  };
}

// Fine-tuned offsets for label centroids on concave or coastal comarques so labels sit cleanly inside
const LABEL_OFFSETS: Record<string, { dx: number; dy: number }> = {
  '11': { dx: -4, dy: 4 }, // Baix Llobregat
  '13': { dx: 6, dy: 2 },  // Barcelonès
  '17': { dx: -2, dy: 3 }, // Garraf
  '21': { dx: 4, dy: 2 },  // Maresme
  '36': { dx: 0, dy: 3 },  // Tarragonès
  '40': { dx: 0, dy: -3 }, // Vallès Occidental
  '43': { dx: 0, dy: -2 }, // Lluçanès
};

export const COMARQUES_DATA: ComarcaFeature[] = (comarquesGeoJson as any).features.map((feat: any) => {
  const p = feat.properties;
  const codi: string = p.codi;
  const { svgPath, centroid, bbox } = geometryToSvg(feat.geometry);
  const offset = LABEL_OFFSETS[codi] || { dx: 0, dy: 0 };

  const capitals: CapitalPoint[] = (p.capitalsCoord || []).map((c: any) => {
    const [x, y] = projectLonLat(c.lon, c.lat);
    return {
      nom: c.nom,
      lon: c.lon,
      lat: c.lat,
      x,
      y,
      codiProv: c.codiProv,
    };
  });

  const didactic = COMARQUES_INFO[codi];

  return {
    codi,
    nom: p.nom,
    capital: p.capital,
    superficieKm2: p.superficieKm2,
    poblacio: p.poblacio,
    dataPoblacio: p.dataPoblacio,
    municipis: p.municipis,
    vegueria: p.vegueria,
    provinciaPrincipal: p.provinciaPrincipal,
    provincies: p.provincies || [],
    esMultiprovincial: Boolean(p.esMultiprovincial),
    capitals,
    svgPath,
    centroid: {
      x: Number((centroid.x + offset.dx).toFixed(1)),
      y: Number((centroid.y + offset.dy).toFixed(1)),
    },
    bbox,
    didactic,
  };
});

export const COMARQUES_BY_CODI: Record<string, ComarcaFeature> = Object.fromEntries(
  COMARQUES_DATA.map(c => [c.codi, c])
);

const PROV_CAPITAL_COMARCA: Record<string, string> = {
  '08': '13', // Barcelona -> Barcelonès
  '17': '20', // Girona -> Gironès
  '25': '33', // Lleida -> Segrià
  '43': '36', // Tarragona -> Tarragonès
};

export const PROVINCIES_DATA: ProvinciaFeature[] = (provinciesGeoJson as any).features.map((feat: any) => {
  const p = feat.properties;
  const codi: string = p.codi;
  const { svgPath, centroid, bbox } = geometryToSvg(feat.geometry);
  const capComarca = COMARQUES_BY_CODI[PROV_CAPITAL_COMARCA[codi]];
  const capPt = capComarca?.capitals[0] || centroid;

  return {
    codi,
    nom: p.nom,
    capital: p.capital,
    superficieKm2: p.superficieKm2,
    svgPath,
    centroid,
    capitalPoint: { x: capPt.x, y: capPt.y },
    bbox,
    didactic: PROVINCIES_INFO[codi],
  };
});

export function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^(el |la |els |les |l'|l’)/i, '')
    .replace(/['’\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
