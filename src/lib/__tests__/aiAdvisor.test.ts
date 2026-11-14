import assert from 'node:assert';
import {
  AGRONOMY_KNOWLEDGE_BASE,
  searchKnowledgeBase
} from '../../data/agronomyKnowledgeBase';
import { POST } from '../../app/api/ai/advisor/route';

console.log('--- STARTING FIELD ADVISOR AI & RAG KNOWLEDGE BASE UNIT TESTS ---');

// 1. Testing RAG Knowledge Base Completeness
console.log('1. Testing RAG Knowledge Base Documents...');
assert(
  AGRONOMY_KNOWLEDGE_BASE.length >= 10,
  `Knowledge base should have at least 10 documents, found: ${AGRONOMY_KNOWLEDGE_BASE.length}`
);

const hasBRIN = AGRONOMY_KNOWLEDGE_BASE.some((d) => d.institution.includes('BRIN'));
const hasFAO = AGRONOMY_KNOWLEDGE_BASE.some((d) => d.institution.includes('FAO'));
const hasBalittanah = AGRONOMY_KNOWLEDGE_BASE.some((d) => d.institution.includes('Balittanah'));
const hasNASA = AGRONOMY_KNOWLEDGE_BASE.some((d) => d.institution.includes('NASA'));
const hasUSDA = AGRONOMY_KNOWLEDGE_BASE.some((d) => d.institution.includes('USDA'));
const hasESA = AGRONOMY_KNOWLEDGE_BASE.some((d) => d.institution.includes('ESA') || d.institution.includes('Copernicus'));

assert(hasBRIN, 'Knowledge base must contain BRIN agronomic documents');
assert(hasFAO, 'Knowledge base must contain FAO standard documents');
assert(hasBalittanah, 'Knowledge base must contain Balittanah soil fertility documents');
assert(hasNASA, 'Knowledge base must contain NASA Earth observation documents (SMAP, GPM, ECOSTRESS, SRTM)');
assert(hasUSDA, 'Knowledge base must contain USDA NRCS soil survey documents');
assert(hasESA, 'Knowledge base must contain ESA Copernicus Sentinel-2 documents');
console.log('✓ Knowledge base covers BRIN, Balittanah, FAO, NASA, USDA, and ESA standards');

// 2. Testing Semantic / Keyword RAG Retrieval
console.log('2. Testing Keyword Search in Knowledge Base...');
const queryDolomit = searchKnowledgeBase('rekomendasi kapur dolomit untuk tanah masam');
assert(queryDolomit.length > 0, 'Search for dolomit should return results');
assert(
  queryDolomit[0].doc.tags.includes('dolomit') || queryDolomit[0].doc.tags.includes('ph'),
  'Top result should match dolomit or pH tag'
);

const querySorgum = searchKnowledgeBase('varietas sorgum tahan kemarau ekstrim');
assert(querySorgum.length > 0, 'Search for sorgum should return results');
assert(
  querySorgum[0].doc.tags.includes('sorgum'),
  'Top result should match sorgum tag'
);

const querySMAP = searchKnowledgeBase('kelembapan tanah zona perakaran nasa smap');
assert(querySMAP.length > 0, 'Search for SMAP should return results');
assert(
  querySMAP[0].doc.tags.includes('smap'),
  'Top result for SMAP should match smap tag'
);
console.log('✓ searchKnowledgeBase correctly ranks and retrieves matching agronomy and NASA documents');

// 3. Testing Advisor API Route: Validation
console.log('3. Testing Advisor API Route Validation...');
async function testAdvisorValidation() {
  const reqEmpty = new Request('http://localhost:3000/api/ai/advisor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: '   ' })
  });
  const resEmpty = await POST(reqEmpty);
  assert.strictEqual(resEmpty.status, 400, 'Empty message must return HTTP 400');

  // Valid request with telemetry
  const validPayload = {
    message: 'Bagaimana cara mengatasi tanah lempung masam pH 5.2?',
    telemetry: {
      location: {
        lat: -10.1542,
        lon: 123.821,
        placeName: 'Kupang Timur'
      },
      elevation_m: 85,
      soilData: {
        textureClass: 'Clay',
        clay: 48,
        sand: 22,
        silt: 30,
        soc: 1.2,
        ph: 5.2,
        cec: 24,
        awc: 125,
        source: 'ISRIC_SOILGRIDS_LIVE',
        fetchedAt: '2026-11-12T00:00:00.000Z',
        cached: false,
        fallbackReason: null,
        observationPeriod: 'Standard Depth Layer 0-30cm'
      },
      climateData: {
        annualRainfall_mm: 1150,
        monthlyData: [],
        rootZoneSoilMoisture: 0.28,
        soilWetnessCategory: 'Deficit',
        avgTemp_c: 27.5,
        source: 'NASA_POWER_LIVE',
        lastUpdated: '2026-11-12',
        fetchedAt: '2026-11-12T00:00:00.000Z',
        cached: false,
        fallbackReason: null,
        observationPeriod: 'Historical Baseline'
      },
      selectedPathway: 'B',
      activePlan: {
        pathwayId: 'B',
        title: 'Pathway B',
        subtitle: 'Drought Resilience',
        description: 'Tahan Kemarau',
        seasons: [
          { seasonIndex: 1, crop: { name: 'Jagung Hibrida' } },
          { seasonIndex: 2, crop: { name: 'Kedelai' } },
          { seasonIndex: 3, crop: { name: 'Kacang Hijau' } },
          { seasonIndex: 4, crop: { name: 'Sorgum Bioguma' } }
        ],
        soilBatteryScore: 88,
        initialBatteryScore: 65,
        waterSavingsPct: 52,
        netNitrogenDelta: 120,
        projectedProfitIndex: 75,
        compositeScore: 82,
        recommendationBadges: ['Aman Kemarau']
      }
    }
  };

  const reqValid = new Request('http://localhost:3000/api/ai/advisor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validPayload)
  });

  const resValid = await POST(reqValid);
  assert.strictEqual(resValid.status, 200, 'Valid request must return HTTP 200');

  const data = await resValid.json();
  assert(data.reply && data.reply.length > 50, 'Response reply should not be empty');
  assert(Array.isArray(data.citations), 'Response must include citations array');
  assert(data.citations.length > 0, 'Citations array should not be empty');
  assert(data.mode, 'Response must indicate grounding mode');

  // Verify no em dash in deterministic reply
  assert(!data.reply.includes('—'), 'Generated reply must not contain em dash');

  console.log('✓ Advisor API route generates grounded responses with citations');
}

testAdvisorValidation().then(() => {
  console.log('--- ALL FIELD ADVISOR & RAG TESTS PASSED SUCCESSFULLY! ---');
});
