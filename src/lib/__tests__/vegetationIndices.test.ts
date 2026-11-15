import assert from 'node:assert';
import {
  buildCompositeVegetation,
  classifyVegetationCover,
  computeLandsatNdvi,
  computeSentinel2Ndvi,
  scaleModisIndex
} from '../vegetation';
import { GET } from '../../app/api/vegetation-indices/route';

async function runTests() {
  console.log('--- STARTING MULTISPECTRAL VEGETATION INDICES TESTS ---');

  // 1. Sentinel-2 L2A NDVI
  const s2Ndvi = computeSentinel2Ndvi(1507, 3296);
  assert.strictEqual(s2Ndvi, 0.372, 'Sentinel-2 NDVI should match (B08-B04)/(B08+B04)');
  assert.strictEqual(computeSentinel2Ndvi(0, 0), null, 'Sentinel-2 zero reflectance returns null');

  // 2. Landsat Collection 2 Level-2 NDVI (scale 0.0000275 * DN - 0.2)
  const lsNdvi = computeLandsatNdvi(10905, 15711);
  assert.strictEqual(lsNdvi, 0.398, 'Landsat C2 L2 NDVI should apply official scale & offset');
  assert.strictEqual(computeLandsatNdvi(-10, 15000), null, 'Landsat invalid DN returns null');

  // 3. MODIS MOD13Q1/MYD13Q1 (scale 0.0001)
  assert.strictEqual(scaleModisIndex(3435), 0.344, 'MODIS NDVI 3435 -> 0.344');
  assert.strictEqual(scaleModisIndex(2550), 0.255, 'MODIS EVI 2550 -> 0.255');
  assert.strictEqual(scaleModisIndex(-3000), null, 'MODIS fill value out of range returns null');

  // 4. Cover Classification & Composite Priority (Sentinel-2 > Landsat > MODIS)
  assert.strictEqual(classifyVegetationCover(0.15), 'Bare / Fallow');
  assert.strictEqual(classifyVegetationCover(0.35), 'Sparse / Stressed');
  assert.strictEqual(classifyVegetationCover(0.52), 'Moderate Canopy');
  assert.strictEqual(classifyVegetationCover(0.72), 'Dense Vegetation');

  const comp = buildCompositeVegetation(
    {
      available: true,
      sceneId: 'S2_TEST',
      acquisitionDate: '2026-11-13T02:04:41Z',
      cloudCoverPct: 2.5,
      ndvi: 0.372,
      redReflectance: 1507,
      nirReflectance: 3296,
      resolutionMeters: 10
    },
    {
      available: true,
      sceneId: 'LC09_TEST',
      platform: 'landsat-9',
      acquisitionDate: '2026-10-27T01:53:22Z',
      cloudCoverPct: 7.4,
      ndvi: 0.398,
      redReflectance: 0.0999,
      nirReflectance: 0.2321,
      resolutionMeters: 30
    },
    {
      available: true,
      sceneId: 'MYD13Q1_TEST',
      acquisitionDate: '2026-10-08T00:00:00Z',
      ndvi: 0.344,
      evi: 0.255,
      resolutionMeters: 250
    },
    '2026-11-15T00:00:00Z'
  );
  assert.strictEqual(comp.source, 'PLANETARY_COMPUTER_LIVE');
  assert.strictEqual(comp.primarySensor, 'Sentinel-2');
  assert.strictEqual(comp.compositeNdvi, 0.372);
  assert.strictEqual(comp.coverClass, 'Sparse / Stressed');

  // 5. Route Validation & Mocked Upstream Fetch
  const badReq = new Request('http://localhost/api/vegetation-indices?lat=999&lon=123.6');
  const badRes = await GET(badReq);
  assert.strictEqual(badRes.status, 400, 'Invalid latitude must return 400');

  const origFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith('/search')) {
      const body = JSON.parse(String(init?.body || '{}'));
      const col = body.collections?.[0];
      if (col === 'sentinel-2-l2a') {
        return new Response(
          JSON.stringify({
            features: [{ id: 'S2_MOCK', properties: { datetime: '2026-11-13', 'eo:cloud_cover': 2.5 } }]
          }),
          { status: 200 }
        );
      }
      if (col === 'landsat-c2-l2') {
        return new Response(
          JSON.stringify({
            features: [
              {
                id: 'LC09_MOCK',
                properties: { datetime: '2026-10-27', 'eo:cloud_cover': 7.4, platform: 'landsat-9' }
              }
            ]
          }),
          { status: 200 }
        );
      }
      if (col === 'modis-13Q1-061') {
        return new Response(
          JSON.stringify({
            features: [{ id: 'MODIS_MOCK', properties: { start_datetime: '2026-10-08' } }]
          }),
          { status: 200 }
        );
      }
    }
    if (url.includes('collection=sentinel-2-l2a')) {
      return new Response(JSON.stringify({ values: [1507, 3296] }), { status: 200 });
    }
    if (url.includes('collection=landsat-c2-l2')) {
      return new Response(JSON.stringify({ values: [10905, 15711] }), { status: 200 });
    }
    if (url.includes('collection=modis-13Q1-061')) {
      return new Response(JSON.stringify({ values: [3435, 2550] }), { status: 200 });
    }
    return new Response('{}', { status: 404 });
  }) as typeof fetch;

  try {
    const okReq = new Request('http://localhost/api/vegetation-indices?lat=-10.17&lon=123.60');
    const okRes = await GET(okReq);
    assert.strictEqual(okRes.status, 200);
    const payload = await okRes.json();
    assert.strictEqual(payload.source, 'PLANETARY_COMPUTER_LIVE');
    assert.strictEqual(payload.sentinel2.ndvi, 0.372);
    assert.strictEqual(payload.landsat.ndvi, 0.398);
    assert.strictEqual(payload.modis.ndvi, 0.344);
    assert.strictEqual(payload.modis.evi, 0.255);
    assert.strictEqual(payload.cached, false);

    // Cache hit on second call
    const cachedRes = await GET(okReq);
    const cachedPayload = await cachedRes.json();
    assert.strictEqual(cachedPayload.cached, true);
  } finally {
    globalThis.fetch = origFetch;
  }

  console.log('✓ All multispectral vegetation indices (Sentinel-2, Landsat, MODIS) tests passed!');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
