import assert from 'node:assert';
import { GET as getNasaClimate } from '@/app/api/nasa-climate/route';
import { GET as getSoilProfile } from '@/app/api/soil-profile/route';

console.log('--- STARTING API PROXY SCIENTIFIC INTEGRITY & PROVENANCE TESTS ---');

const originalFetch = globalThis.fetch;

async function runTests() {
  try {
    // -------------------------------------------------------------
    // CRITERION 1: INVALID LATITUDE/LONGITUDE
    // -------------------------------------------------------------
    console.log('\n[CRITERION 1] Testing invalid latitude/longitude validation...');
    {
      // Case 1a: Latitude > 90 on NASA API
      const reqLatHigh = new Request('http://localhost:3000/api/nasa-climate?lat=95.5&lon=123.82');
      const resLatHigh = await getNasaClimate(reqLatHigh);
      assert.strictEqual(resLatHigh.status, 400, 'NASA API must return 400 for latitude > 90');
      const bodyLatHigh = await resLatHigh.json();
      assert.ok(bodyLatHigh.error.includes('tidak valid'), 'Error message must specify invalid coordinates');

      // Case 1b: Latitude < -90 on NASA API
      const reqLatLow = new Request('http://localhost:3000/api/nasa-climate?lat=-92.0&lon=123.82');
      const resLatLow = await getNasaClimate(reqLatLow);
      assert.strictEqual(resLatLow.status, 400, 'NASA API must return 400 for latitude < -90');

      // Case 1c: Longitude > 180 on SoilGrids API
      const reqLonHigh = new Request('http://localhost:3000/api/soil-profile?lat=-10.15&lon=185.0');
      const resLonHigh = await getSoilProfile(reqLonHigh);
      assert.strictEqual(resLonHigh.status, 400, 'SoilGrids API must return 400 for longitude > 180');
      const bodyLonHigh = await resLonHigh.json();
      assert.ok(bodyLonHigh.error.includes('tidak valid'), 'Error message must specify invalid coordinates');

      // Case 1d: Longitude < -180 on SoilGrids API
      const reqLonLow = new Request('http://localhost:3000/api/soil-profile?lat=-10.15&lon=-185.0');
      const resLonLow = await getSoilProfile(reqLonLow);
      assert.strictEqual(resLonLow.status, 400, 'SoilGrids API must return 400 for longitude < -180');

      console.log('✓ Acceptance Criterion 1 (invalid latitude/longitude) verified: status 400 with controlled validation error.');
    }

    // -------------------------------------------------------------
    // CRITERION 2: MISSING COORDINATE PARAMETERS
    // -------------------------------------------------------------
    console.log('\n[CRITERION 2] Testing missing coordinate parameters...');
    {
      // Case 2a: Missing lat parameter on NASA API
      const reqNoLatNasa = new Request('http://localhost:3000/api/nasa-climate?lon=123.82');
      const resNoLatNasa = await getNasaClimate(reqNoLatNasa);
      assert.strictEqual(resNoLatNasa.status, 400, 'NASA API must return 400 when lat is missing');
      const bodyNoLatNasa = await resNoLatNasa.json();
      assert.ok(bodyNoLatNasa.error.includes('Parameter koordinat tidak lengkap'), 'Must state missing coordinate parameter');

      // Case 2b: Missing lon parameter on NASA API
      const reqNoLonNasa = new Request('http://localhost:3000/api/nasa-climate?lat=-10.15');
      const resNoLonNasa = await getNasaClimate(reqNoLonNasa);
      assert.strictEqual(resNoLonNasa.status, 400, 'NASA API must return 400 when lon is missing');

      // Case 2c: Missing lat parameter on SoilGrids API
      const reqNoLatSoil = new Request('http://localhost:3000/api/soil-profile?lon=123.82');
      const resNoLatSoil = await getSoilProfile(reqNoLatSoil);
      assert.strictEqual(resNoLatSoil.status, 400, 'SoilGrids API must return 400 when lat is missing');
      const bodyNoLatSoil = await resNoLatSoil.json();
      assert.ok(bodyNoLatSoil.error.includes('Parameter koordinat tidak lengkap'), 'Must state missing coordinate parameter');

      // Case 2d: Missing both parameters
      const reqEmpty = new Request('http://localhost:3000/api/soil-profile');
      const resEmpty = await getSoilProfile(reqEmpty);
      assert.strictEqual(resEmpty.status, 400, 'SoilGrids API must return 400 when both params missing');

      console.log('✓ Acceptance Criterion 2 (missing coordinate parameters) verified: status 400 with parameter missing error.');
    }

    // -------------------------------------------------------------
    // CRITERION 3: NASA LIVE RESPONSE
    // -------------------------------------------------------------
    console.log('\n[CRITERION 3] Testing NASA live response parsing...');
    {
      const mockNasaLivePayload = {
        properties: {
          parameter: {
            PRECTOTCORR: { '20250101': 10.5, '20250201': 8.0, '20250701': 1.0 },
            T2M_MIN: { '20250101': 22.5, '20250201': 23.0, '20250701': 20.0 },
            T2M_MAX: { '20250101': 31.5, '20250201': 32.0, '20250701': 33.0 },
            T2M: { '20250101': 27.0, '20250201': 27.5, '20250701': 26.5 },
            ALLSKY_SFC_SW_DWN: { '20250101': 18.0, '20250201': 19.0, '20250701': 22.0 },
            GWETROOT: { '20250101': 0.38, '20250201': 0.40, '20250701': 0.22 }
          }
        }
      };

      globalThis.fetch = async () => {
        return new Response(JSON.stringify(mockNasaLivePayload), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      };

      const req = new Request('http://localhost:3000/api/nasa-climate?lat=-10.15&lon=123.82');
      const res = await getNasaClimate(req);
      assert.strictEqual(res.status, 200, 'NASA API live response should return 200 OK');
      const data = await res.json();

      assert.strictEqual(data.source, 'NASA_POWER_LIVE', 'Source must be NASA_POWER_LIVE');
      assert.strictEqual(data.cached, false, 'Initial live response must have cached: false');
      assert.strictEqual(data.fallbackReason, null, 'Live response fallbackReason must be null');
      assert.strictEqual(data.monthlyData.length, 12, 'Must aggregate into 12 monthly profiles');
      assert.ok(data.annualRainfall_mm > 0, 'Annual rainfall must be calculated');
      assert.ok(data.rootZoneSoilMoisture >= 0 && data.rootZoneSoilMoisture <= 1, 'GWETROOT must be between 0 and 1');
      assert.strictEqual(typeof data.fetchedAt, 'string', 'fetchedAt must be an ISO string');
      assert.strictEqual(data.observationPeriod, 'Historical 1-Year Baseline (NASA POWER Agroclimatology v2.0)');

      console.log('✓ Acceptance Criterion 3 (NASA live response) verified: live telemetry parsed, source NASA_POWER_LIVE.');
    }

    // -------------------------------------------------------------
    // CRITERION 4: NASA TIMEOUT
    // -------------------------------------------------------------
    console.log('\n[CRITERION 4] Testing NASA timeout failover...');
    {
      globalThis.fetch = async () => {
        const error = new Error('The operation was aborted due to timeout');
        error.name = 'AbortError';
        throw error;
      };

      const req = new Request('http://localhost:3000/api/nasa-climate?lat=-8.50&lon=115.20');
      const res = await getNasaClimate(req);
      assert.strictEqual(res.status, 200, 'NASA timeout must gracefully failover with status 200');
      const data = await res.json();

      assert.strictEqual(data.source, 'FALLBACK_CLIMATOLOGY', 'Source must be FALLBACK_CLIMATOLOGY on timeout');
      assert.strictEqual(data.cached, false, 'Timeout fallback must have cached: false');
      assert.ok(data.fallbackReason !== null, 'Timeout fallback must provide fallbackReason');
      assert.ok(data.fallbackReason.includes('timeout') || data.fallbackReason.includes('aborted'), 'Reason must indicate timeout');

      console.log('✓ Acceptance Criterion 4 (NASA timeout) verified: failover to FALLBACK_CLIMATOLOGY with descriptive reason.');
    }

    // -------------------------------------------------------------
    // CRITERION 5: NASA MALFORMED UPSTREAM RESPONSE
    // -------------------------------------------------------------
    console.log('\n[CRITERION 5] Testing NASA malformed upstream response...');
    {
      globalThis.fetch = async () => {
        return new Response(JSON.stringify({ properties: { invalid_field: true } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      };

      const req = new Request('http://localhost:3000/api/nasa-climate?lat=-7.25&lon=112.75');
      const res = await getNasaClimate(req);
      assert.strictEqual(res.status, 200, 'Malformed upstream response must gracefully failover with status 200');
      const data = await res.json();

      assert.strictEqual(data.source, 'FALLBACK_CLIMATOLOGY', 'Malformed upstream response must trigger FALLBACK_CLIMATOLOGY');
      assert.strictEqual(data.cached, false, 'Fallback response must have cached: false');
      assert.ok(data.fallbackReason !== null, 'Must record fallback reason');
      assert.ok(data.fallbackReason.includes('Format data parameter NASA POWER tidak valid'), 'Reason must indicate malformed format');

      console.log('✓ Acceptance Criterion 5 (NASA malformed upstream response) verified: caught malformed JSON and triggered failover.');
    }

    // -------------------------------------------------------------
    // CRITERION 6: NASA FALLBACK METADATA
    // -------------------------------------------------------------
    console.log('\n[CRITERION 6] Testing NASA fallback metadata completeness...');
    {
      globalThis.fetch = async () => {
        throw new Error('NASA POWER upstream 503 Service Unavailable');
      };

      const req = new Request('http://localhost:3000/api/nasa-climate?lat=-9.65&lon=120.26'); // Sumba Timur
      const res = await getNasaClimate(req);
      const data = await res.json();

      assert.strictEqual(data.source, 'FALLBACK_CLIMATOLOGY');
      assert.strictEqual(typeof data.fetchedAt, 'string');
      assert.strictEqual(data.cached, false);
      assert.strictEqual(typeof data.fallbackReason, 'string');
      assert.strictEqual(data.observationPeriod, 'Regional Agroclimatic Normal Baseline (Nusa Tenggara)');
      assert.strictEqual(data.soilWetnessCategory, 'Deficit', 'Southern dry zone (Sumba Timur) should be Deficit');

      console.log('✓ Acceptance Criterion 6 (NASA fallback metadata) verified: source, fetchedAt, cached, fallbackReason, observationPeriod intact.');
    }

    // -------------------------------------------------------------
    // CRITERION 7: NASA CACHED METADATA
    // -------------------------------------------------------------
    console.log('\n[CRITERION 7] Testing NASA cached metadata...');
    {
      const mockPayload = {
        properties: {
          parameter: {
            PRECTOTCORR: { '20250101': 5.0 },
            T2M_MIN: { '20250101': 23.0 },
            T2M_MAX: { '20250101': 32.0 },
            T2M: { '20250101': 27.0 },
            ALLSKY_SFC_SW_DWN: { '20250101': 19.0 },
            GWETROOT: { '20250101': 0.45 }
          }
        }
      };

      globalThis.fetch = async () => {
        return new Response(JSON.stringify(mockPayload), { status: 200 });
      };

      // First call -> populates cache
      const req1 = new Request('http://localhost:3000/api/nasa-climate?lat=-6.90&lon=107.60');
      const res1 = await getNasaClimate(req1);
      const data1 = await res1.json();
      assert.strictEqual(data1.cached, false, 'First call is not cached');
      assert.strictEqual(data1.source, 'NASA_POWER_LIVE');

      // Second call -> should be retrieved from cache
      const req2 = new Request('http://localhost:3000/api/nasa-climate?lat=-6.90&lon=107.60');
      const res2 = await getNasaClimate(req2);
      const data2 = await res2.json();
      assert.strictEqual(data2.cached, true, 'Second call must return cached: true');
      assert.strictEqual(data2.source, 'NASA_POWER_LIVE', 'Source remains NASA_POWER_LIVE even when served from cache');
      assert.strictEqual(data2.fetchedAt, data1.fetchedAt, 'fetchedAt must preserve original fetch timestamp');
      assert.strictEqual(data2.observationPeriod, data1.observationPeriod);

      console.log('✓ Acceptance Criterion 7 (NASA cached metadata) verified: cached: true returned while preserving live source and timestamps.');
    }

    // -------------------------------------------------------------
    // CRITERION 8: SOILGRIDS LIVE RESPONSE
    // -------------------------------------------------------------
    console.log('\n[CRITERION 8] Testing SoilGrids live response parsing...');
    {
      const mockSoilGridsPayload = {
        properties: {
          layers: [
            { name: 'clay', depths: [{ label: '0-30cm', values: { mean: 300 } }] },
            { name: 'sand', depths: [{ label: '0-30cm', values: { mean: 400 } }] },
            { name: 'silt', depths: [{ label: '0-30cm', values: { mean: 300 } }] },
            { name: 'soc', depths: [{ label: '0-30cm', values: { mean: 115 } }] },
            { name: 'phh2o', depths: [{ label: '0-30cm', values: { mean: 64 } }] },
            { name: 'cec', depths: [{ label: '0-30cm', values: { mean: 195 } }] }
          ]
        }
      };

      globalThis.fetch = async () => {
        return new Response(JSON.stringify(mockSoilGridsPayload), { status: 200 });
      };

      const req = new Request('http://localhost:3000/api/soil-profile?lat=-10.15&lon=123.82');
      const res = await getSoilProfile(req);
      assert.strictEqual(res.status, 200, 'SoilGrids live response should return 200 OK');
      const data = await res.json();

      assert.strictEqual(data.source, 'ISRIC_SOILGRIDS_LIVE', 'Source must be ISRIC_SOILGRIDS_LIVE');
      assert.strictEqual(data.cached, false, 'Initial response must have cached: false');
      assert.strictEqual(data.fallbackReason, null, 'Live response fallbackReason must be null');
      assert.strictEqual(data.clay, 30.0);
      assert.strictEqual(data.sand, 40.0);
      assert.strictEqual(data.silt, 30.0);
      assert.strictEqual(data.soc, 1.15);
      assert.strictEqual(data.ph, 6.4);
      assert.strictEqual(data.cec, 19.5);
      assert.ok(data.awc > 0, 'AWC must be calculated via pedotransfer');
      assert.strictEqual(typeof data.textureClass, 'string');
      assert.strictEqual(data.observationPeriod, 'Standard Depth Layer 0-30cm (ISRIC SoilGrids v2.0)');

      console.log('✓ Acceptance Criterion 8 (SoilGrids live response) verified: physical properties and pedotransfer AWC calculated.');
    }

    // -------------------------------------------------------------
    // CRITERION 9: SOILGRIDS TIMEOUT
    // -------------------------------------------------------------
    console.log('\n[CRITERION 9] Testing SoilGrids timeout failover...');
    {
      globalThis.fetch = async () => {
        const error = new Error('ISRIC SoilGrids connection timed out after 6000ms');
        error.name = 'TimeoutError';
        throw error;
      };

      const req = new Request('http://localhost:3000/api/soil-profile?lat=-8.50&lon=115.20');
      const res = await getSoilProfile(req);
      assert.strictEqual(res.status, 200, 'SoilGrids timeout must gracefully failover with status 200');
      const data = await res.json();

      assert.strictEqual(data.source, 'REGIONAL_FALLBACK', 'Source must be REGIONAL_FALLBACK on timeout');
      assert.strictEqual(data.cached, false, 'Timeout fallback must have cached: false');
      assert.ok(data.fallbackReason !== null, 'Timeout fallback must provide fallbackReason');
      assert.ok(data.fallbackReason.includes('timed out'), 'Reason must indicate timeout');

      console.log('✓ Acceptance Criterion 9 (SoilGrids timeout) verified: failover to REGIONAL_FALLBACK with descriptive reason.');
    }

    // -------------------------------------------------------------
    // CRITERION 10: SOILGRIDS MALFORMED UPSTREAM RESPONSE
    // -------------------------------------------------------------
    console.log('\n[CRITERION 10] Testing SoilGrids malformed upstream response...');
    {
      globalThis.fetch = async () => {
        return new Response(JSON.stringify({ properties: { layers: 'not-an-array' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      };

      const req = new Request('http://localhost:3000/api/soil-profile?lat=-7.25&lon=112.75');
      const res = await getSoilProfile(req);
      assert.strictEqual(res.status, 200, 'Malformed SoilGrids response must gracefully failover with status 200');
      const data = await res.json();

      assert.strictEqual(data.source, 'REGIONAL_FALLBACK', 'Malformed upstream response must trigger REGIONAL_FALLBACK');
      assert.strictEqual(data.cached, false, 'Fallback response must have cached: false');
      assert.ok(data.fallbackReason !== null);
      assert.ok(data.fallbackReason.includes('Format respon ISRIC SoilGrids tidak sesuai'), 'Reason must indicate invalid layers');

      console.log('✓ Acceptance Criterion 10 (SoilGrids malformed upstream response) verified: malformed layers caught, regional fallback active.');
    }

    // -------------------------------------------------------------
    // CRITERION 11: SOILGRIDS FALLBACK METADATA
    // -------------------------------------------------------------
    console.log('\n[CRITERION 11] Testing SoilGrids fallback metadata completeness...');
    {
      globalThis.fetch = async () => {
        throw new Error('ISRIC SoilGrids 500 Internal Server Error');
      };

      const req = new Request('http://localhost:3000/api/soil-profile?lat=-9.65&lon=120.26');
      const res = await getSoilProfile(req);
      const data = await res.json();

      assert.strictEqual(data.source, 'REGIONAL_FALLBACK');
      assert.strictEqual(typeof data.fetchedAt, 'string');
      assert.strictEqual(data.cached, false);
      assert.strictEqual(typeof data.fallbackReason, 'string');
      assert.strictEqual(data.observationPeriod, 'Regional Tropical Soil Profile Estimate (Depth 0-30cm)');
      assert.ok(data.awc > 0, 'Fallback soil must have valid calculated AWC');
      assert.ok(data.textureClass.length > 0, 'Fallback soil must have texture classification');

      console.log('✓ Acceptance Criterion 11 (SoilGrids fallback metadata) verified: source, fetchedAt, cached, fallbackReason, observationPeriod intact.');
    }

    // -------------------------------------------------------------
    // CRITERION 12: SOILGRIDS CACHED METADATA
    // -------------------------------------------------------------
    console.log('\n[CRITERION 12] Testing SoilGrids cached metadata...');
    {
      const mockSoilPayload = {
        properties: {
          layers: [
            { name: 'clay', depths: [{ label: '0-30cm', values: { mean: 250 } }] },
            { name: 'sand', depths: [{ label: '0-30cm', values: { mean: 500 } }] },
            { name: 'silt', depths: [{ label: '0-30cm', values: { mean: 250 } }] },
            { name: 'soc', depths: [{ label: '0-30cm', values: { mean: 100 } }] },
            { name: 'phh2o', depths: [{ label: '0-30cm', values: { mean: 68 } }] },
            { name: 'cec', depths: [{ label: '0-30cm', values: { mean: 170 } }] }
          ]
        }
      };

      globalThis.fetch = async () => {
        return new Response(JSON.stringify(mockSoilPayload), { status: 200 });
      };

      // First call -> populates cache
      const req1 = new Request('http://localhost:3000/api/soil-profile?lat=-6.90&lon=107.60');
      const res1 = await getSoilProfile(req1);
      const data1 = await res1.json();
      assert.strictEqual(data1.cached, false, 'First call is not cached');
      assert.strictEqual(data1.source, 'ISRIC_SOILGRIDS_LIVE');

      // Second call -> served from cache
      const req2 = new Request('http://localhost:3000/api/soil-profile?lat=-6.90&lon=107.60');
      const res2 = await getSoilProfile(req2);
      const data2 = await res2.json();
      assert.strictEqual(data2.cached, true, 'Second call must return cached: true');
      assert.strictEqual(data2.source, 'ISRIC_SOILGRIDS_LIVE', 'Source remains ISRIC_SOILGRIDS_LIVE even when cached');
      assert.strictEqual(data2.fetchedAt, data1.fetchedAt, 'fetchedAt must preserve original fetch timestamp');
      assert.strictEqual(data2.observationPeriod, data1.observationPeriod);

      console.log('✓ Acceptance Criterion 12 (SoilGrids cached metadata) verified: cached: true returned while preserving live source and timestamps.');
    }

    console.log('\n================================================================');
    console.log('ALL 12 ACCEPTANCE CRITERIA UNIT & INTEGRATION TESTS PASSED 100%!');
    console.log('================================================================');
  } finally {
    globalThis.fetch = originalFetch;
  }
}

runTests().catch((err) => {
  console.error('Test failure:', err);
  process.exit(1);
});
