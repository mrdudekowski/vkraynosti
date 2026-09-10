import fs from 'node:fs';

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  throw new Error('Usage: node build-tobizina-shape.mjs input.geojson output.svg');
}

const source = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const cape = source.features.find((feature) => feature.properties?.natural === 'cape');
const allCoastline = source.features.filter((feature) => feature.properties?.natural === 'coastline');
const coastline = cape
  ? allCoastline.filter((feature) => Math.max(...feature.geometry.coordinates.map(([lon]) => lon)) <= cape.geometry.coordinates[0] + 0.01)
  : allCoastline;

if (coastline.length === 0) throw new Error('No coastline features found');

const samePoint = (a, b) => Math.abs(a[0] - b[0]) < 0.00001 && Math.abs(a[1] - b[1]) < 0.00001;
const first = coastline.find((feature) => !coastline.some((candidate) => samePoint(candidate.geometry.coordinates.at(-1), feature.geometry.coordinates[0]))) ?? coastline[0];
const orderedFeatures = [first];
while (orderedFeatures.length < coastline.length) {
  const tail = orderedFeatures.at(-1).geometry.coordinates.at(-1);
  const next = coastline.find((feature) => !orderedFeatures.includes(feature) && samePoint(feature.geometry.coordinates[0], tail));
  if (!next) break;
  orderedFeatures.push(next);
}
const orderedCoordinates = orderedFeatures.flatMap((feature, index) => index === 0 ? feature.geometry.coordinates : feature.geometry.coordinates.slice(1));
const points = orderedCoordinates;
const minLon = Math.min(...points.map(([lon]) => lon));
const maxLon = Math.max(...points.map(([lon]) => lon));
const minLat = Math.min(...points.map(([, lat]) => lat));
const maxLat = Math.max(...points.map(([, lat]) => lat));
const midLat = (minLat + maxLat) / 2;
const cosLat = Math.cos((midLat * Math.PI) / 180);
const width = 1000;
const height = 620;
const padding = 42;

const project = ([lon, lat]) => {
  const x = padding + (((lon - minLon) * cosLat) / ((maxLon - minLon) * cosLat)) * (width - padding * 2);
  const y = height - padding - ((lat - minLat) / (maxLat - minLat)) * (height - padding * 2);
  return [x, y];
};

const pathFor = (coordinates) => coordinates.map((coordinate, index) => {
  const [x, y] = project(coordinate);
  return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
}).join(' ');

const coastlinePath = pathFor(orderedCoordinates);
const landPath = pathFor([...orderedCoordinates, orderedCoordinates[0]]);
const capePoint = cape ? project(cape.geometry.coordinates) : null;
const capeMarker = capePoint
  ? `<circle class="cape-marker" cx="${capePoint[0].toFixed(1)}" cy="${capePoint[1].toFixed(1)}" r="7"/>`
  : '';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">Береговая линия мыса Тобизина</title>
  <desc id="desc">Контур построен по данным OpenStreetMap из пользовательского GeoJSON.</desc>
  <defs>
    <radialGradient id="landGlow" cx="36%" cy="35%" r="72%"><stop offset="0" stop-color="#e8a838"/><stop offset=".28" stop-color="#c76b7e"/><stop offset=".62" stop-color="#7ba7bc"/><stop offset="1" stop-color="#1a3c2e"/></radialGradient>
    <filter id="landNoise" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence result="noise" numOctaves="5" baseFrequency=".0065" type="fractalNoise"/><feDisplacementMap yChannelSelector="G" xChannelSelector="R" scale="900" in2="noise" in="SourceGraphic"/></filter>
  </defs>
  <style>.land{fill:url(#landGlow);opacity:.78;filter:url(#landNoise)}.coastline{fill:none;stroke:#1a3c2e;stroke-width:5;stroke-linecap:round;stroke-linejoin:round;opacity:.86}.cape-marker{fill:#c8622a;stroke:#f7f5f0;stroke-width:4}</style>
  <path class="land" d="${landPath}"/>
  <path class="coastline" d="${coastlinePath}"/>
  ${capeMarker}
</svg>
`;

fs.writeFileSync(outputPath, svg);
console.log(JSON.stringify({ features: coastline.length, orderedFeatures: orderedFeatures.map((feature) => feature.id), points: points.length, cape: Boolean(cape), bounds: { minLon, minLat, maxLon, maxLat } }, null, 2));
