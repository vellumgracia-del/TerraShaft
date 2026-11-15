import { NextResponse } from 'next/server';
import { getAppEnv } from '@/lib/env';
import {
  AGRONOMY_KNOWLEDGE_BASE,
  searchKnowledgeBase,
  KnowledgeDocument
} from '@/data/agronomyKnowledgeBase';
import { SoilData, RotationPlan } from '@/types/agronomy';
import { ClimateData, LocationCoordinates } from '@/types/climate';
import type { AgroecologicalProfile } from '@/types/cultivar';

interface TelemetryContext {
  location?: LocationCoordinates;
  elevation_m?: number;
  soilData?: SoilData | null;
  climateData?: ClimateData | null;
  selectedPathway?: 'A' | 'B' | 'C';
  activePlan?: RotationPlan | null;
  agroecologicalProfile?: AgroecologicalProfile | null;
}

interface ChatTurn {
  sender: 'user' | 'assistant';
  text: string;
}

interface AdvisorRequestBody {
  message?: string;
  history?: ChatTurn[];
  telemetry?: TelemetryContext;
  apiKey?: string;
  locale?: 'en' | 'id';
}

export async function POST(request: Request) {
  try {
    const body: AdvisorRequestBody = await request.json();
    const userMessage = body.message?.trim();

    if (!userMessage) {
      return NextResponse.json(
        { error: 'Pesan pertanyaan wajib diisi' },
        { status: 400 }
      );
    }

    const telemetry = body.telemetry || {};
    const env = getAppEnv();
    const clientKey = (
      body.apiKey ||
      request.headers.get('x-gemini-key') ||
      request.headers.get('x-ai-key') ||
      ''
    ).trim();

    let activeProvider: 'deepseek' | 'gemini' | null = null;
    let activeApiKey = '';

    if (clientKey) {
      activeProvider = clientKey.startsWith('sk-') ? 'deepseek' : 'gemini';
      activeApiKey = clientKey;
    } else if (env.deepseekApiKey) {
      activeProvider = 'deepseek';
      activeApiKey = env.deepseekApiKey;
    } else if (env.geminiApiKey) {
      activeProvider = 'gemini';
      activeApiKey = env.geminiApiKey;
    }

    // 1. RAG Retrieval - Search verified knowledge base
    // Combine user query with telemetry clues for comprehensive grounding
    const contextQueryTokens = [
      userMessage,
      telemetry.soilData?.textureClass || '',
      telemetry.soilData && telemetry.soilData.ph < 5.5 ? 'masam ph dolomit' : '',
      telemetry.activePlan?.seasons?.map((s) => s.crop.name).join(' ') || ''
    ].join(' ');

    const searchResults = searchKnowledgeBase(contextQueryTokens, 4);

    // If query was very specific and got < 2 results, fall back to general query search
    const matchedDocs = searchResults.length > 0
      ? searchResults.map((r) => r.doc)
      : searchKnowledgeBase(userMessage, 3).map((r) => r.doc);

    // Default reference documents if still empty
    const finalDocs: KnowledgeDocument[] = matchedDocs.length > 0
      ? matchedDocs
      : [AGRONOMY_KNOWLEDGE_BASE[0], AGRONOMY_KNOWLEDGE_BASE[5], AGRONOMY_KNOWLEDGE_BASE[6]];

    // 2. Prepare Grounding Context Payload
    const fieldSummary = formatTelemetrySummary(telemetry);

    // 3. Execution: Call DeepSeek or Gemini when an API key is configured
    const locale = body.locale === 'en' ? 'en' : 'id';
    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
    const geminiModel = 'gemini-2.5-flash';
    const deepseekModel = env.deepseekModel || 'deepseek-flash';

    if (activeProvider && activeApiKey) {
      const systemPrompt = buildSystemPrompt(
        fieldSummary,
        finalDocs,
        locale,
        telemetry.agroecologicalProfile
      );

      try {
        const aiResponse =
          activeProvider === 'deepseek'
            ? await callDeepSeekWithGrounding(
                activeApiKey,
                deepseekModel,
                systemPrompt,
                userMessage,
                history
              )
            : await callGeminiWithGrounding(
                activeApiKey,
                geminiModel,
                systemPrompt,
                userMessage,
                history
              );

        return NextResponse.json({
          reply: aiResponse,
          citations: finalDocs.map((d, idx) => ({
            index: idx + 1,
            id: d.id,
            title: d.title,
            institution: d.institution,
            year: d.year,
            citation: d.citation
          })),
          mode: activeProvider === 'deepseek' ? 'deepseek_grounded' : 'gemini_grounded',
          model: activeProvider === 'deepseek' ? deepseekModel : geminiModel,
          matchedTopics: finalDocs.map((d) => d.title)
        });
      } catch (llmError) {
        console.warn(`${activeProvider} API call failed, falling back to local agronomy engine:`, llmError);
        // Fall through to deterministic agronomy response
      }
    }

    // 4. Deterministic Agronomy RAG Synthesis (Zero-hallucination baseline)
    const localAdvisory = generateDeterministicAdvisory(userMessage, telemetry, finalDocs, locale);

    return NextResponse.json({
      reply: localAdvisory,
      citations: finalDocs.map((d, idx) => ({
        index: idx + 1,
        id: d.id,
        title: d.title,
        institution: d.institution,
        year: d.year,
        citation: d.citation
      })),
      mode: 'knowledge_base_grounded',
      model: 'deterministic-rag',
      matchedTopics: finalDocs.map((d) => d.title)
    });
  } catch (error) {
    console.error('Field advisor API error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses konsultasi agronomi' },
      { status: 500 }
    );
  }
}

function formatTelemetrySummary(telemetry: TelemetryContext): string {
  const loc = telemetry.location;
  const soil = telemetry.soilData;
  const climate = telemetry.climateData;
  const plan = telemetry.activePlan;

  const lines: string[] = [];
  lines.push(`Lokasi Lahan: ${loc?.placeName || 'Tidak ditentukan'} (Lat: ${loc?.lat ?? '-'}, Lon: ${loc?.lon ?? '-'})`);
  lines.push(`Elevasi Model DEM: ${telemetry.elevation_m ?? '-'} mdpl`);

  if (soil) {
    lines.push(
      `Profil Tanah (0-30cm): Tekstur ${soil.textureClass} (Lempung ${soil.clay}%, Pasir ${soil.sand}%, Debu ${soil.silt}%), pH H2O: ${soil.ph}, SOC: ${soil.soc}%, KTK/CEC: ${soil.cec} cmol/kg, AWC: ${soil.awc} mm`
    );
  }

  if (climate) {
    lines.push(
      `Telemetri NASA POWER: Curah Hujan Tahunan (PRECTOTCORR) ${climate.annualRainfall_mm} mm, Rata-rata Indikator Lengas Akar GWETROOT (model-assimilated): ${climate.rootZoneSoilMoisture}`
    );
  }

  if (telemetry.agroecologicalProfile) {
    const aez = telemetry.agroecologicalProfile;
    lines.push(
      `Agroecological Zone Profile: Country=${aez.country} (${aez.country_code}/${aez.macro_region}), AEZ=${aez.agroecological_zone}, Elevation Band=${aez.elevation_band}, Photoperiod=${aez.photoperiod_class}, Annual GDD=${aez.growing_degree_days_annual}`
    );
  }

  if (plan && plan.seasons) {
    lines.push(
      `Active Rotation Pathway (${telemetry.selectedPathway || 'A'}): ` +
        plan.seasons
          .map((s) => `S${s.seasonIndex} (${s.crop.name_en || s.crop.name} / Cultivar: ${s.crop.recommended_variety || 'Archetype'})`)
          .join(' -> ') +
        ` | Soil Battery Score: ${plan.soilBatteryScore}%`
    );
  }

  return lines.join('\n');
}

function buildSystemPrompt(
  telemetrySummary: string,
  docs: KnowledgeDocument[],
  locale: 'en' | 'id' = 'id',
  aez?: AgroecologicalProfile | null
): string {
  const documentsContext = docs
    .map(
      (d, i) =>
        `[Doc ${i + 1}] ${d.title} (${d.institution}, ${d.year})\nSummary: ${d.summary}\nGuidance:\n${d.recommendations.map((r) => `- ${r}`).join('\n')}\nCitation: ${d.citation}`
    )
    .join('\n\n');

  const isIndonesia = !aez || aez.country_code === 'ID';
  const regionGuardrail = isIndonesia
    ? 'Location is in Indonesia; national Indonesian cultivar references (Inpago, Bisi, Anjasmoro, Vima, Bioguma) are locally verified.'
    : `CRITICAL GLOBAL LOCALIZATION RULE: Location is in ${aez.country} (${aez.country_code}), NOT Indonesia. NEVER recommend Indonesian cultivar names (Inpago, Situ Bagendit, Bisi 18, Anjasmoro, Grobogan, Vima, Bioguma) for this site. Use only cultivars verified in active telemetry or advise consulting ${aez.country} extension seed registries.`;

  const langRule =
    locale === 'en'
      ? 'Respond in clear, professional agronomy English.'
      : 'Gunakan bahasa Indonesia profesional yang jelas, terstruktur, dan aplikatif untuk petani di lapangan.';

  return `You are TerraShaft Agronomist AI, a precision dryland agronomy and agricultural extension decision-support assistant.

STRICT ANTI-HALLUCINATION RULES:
1. Answer ONLY using the provided field telemetry and reference documents.
2. ${regionGuardrail}
3. Cite documents using bracketed numbers like [1], [2].
4. Never alter computed telemetry values, cultivar registration statuses, or confidence levels.
5. ${langRule} Do not use emojis or em-dashes.

Active Field Telemetry:
${telemetrySummary}

Reference Knowledge Base (RAG):
${documentsContext}`;
}

async function callDeepSeekWithGrounding(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
  history: ChatTurn[]
): Promise<string> {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history
      .filter((turn) => turn.text?.trim())
      .map((turn) => ({
        role: turn.sender === 'assistant' ? 'assistant' : 'user',
        content: turn.text.trim()
      })),
    { role: 'user', content: userMessage }
  ];

  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
      max_tokens: 2048,
      reasoning_effort: 'low'
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepSeek HTTP ${res.status}: ${errText}`);
  }

  const json = await res.json();
  const textOutput = json.choices?.[0]?.message?.content?.trim();

  if (!textOutput) {
    throw new Error('Respon DeepSeek tidak memuat konten teks');
  }

  return textOutput;
}

async function callGeminiWithGrounding(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
  history: ChatTurn[]
): Promise<string> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents = [
    ...history
      .filter((turn) => turn.text?.trim())
      .map((turn) => ({
        role: turn.sender === 'assistant' ? 'model' : 'user',
        parts: [{ text: turn.text.trim() }]
      })),
    {
      role: 'user',
      parts: [{ text: userMessage }]
    }
  ];

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1200
      }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini HTTP ${res.status}: ${errText}`);
  }

  const json = await res.json();
  const textOutput = json.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('Respon Gemini tidak memuat konten teks');
  }

  return textOutput;
}

function generateDeterministicAdvisory(
  userQuery: string,
  telemetry: TelemetryContext,
  docs: KnowledgeDocument[],
  locale: 'en' | 'id' = 'id'
): string {
  const soil = telemetry.soilData;
  const plan = telemetry.activePlan;
  const aez = telemetry.agroecologicalProfile;
  const primaryDoc = docs[0];
  const secondaryDoc = docs[1] || docs[0];

  const lines: string[] = [];

  if (locale === 'en') {
    lines.push(`### Telemetry-Grounded Agronomy Analysis`);
    lines.push('');
    lines.push(
      `Based on site telemetry at **${telemetry.location?.placeName || 'active site'}** (${aez ? `${aez.country}, AEZ: ${aez.agroecological_zone}, ` : ''}Elevation ${telemetry.elevation_m || 85} m asl) with **${soil?.textureClass || 'Loam'}** soil and pH **${soil?.ph || 6.5}**:`
    );
    lines.push('');

    if (soil && soil.ph < 5.8) {
      lines.push(`**1. Soil Chemical Fertility Evaluation (Acidic Reaction)**`);
      lines.push(
        `- Measured topsoil pH is ${soil.ph}. In strongly acidic soils (pH < 5.5), phosphorus availability becomes fixed by aluminum ions [${docs.findIndex((d) => d.tags.includes('ph')) + 1 || 1}].`
      );
      lines.push(
        `- Consider agricultural lime / dolomite buffering (1.5 - 2.0 t/ha) prior to primary tillage to improve nutrient uptake.`
      );
      lines.push('');
    } else if (soil && soil.clay > 35) {
      lines.push(`**1. Heavy Clay Physical Soil Profile**`);
      lines.push(
        `- Clay fraction of ${soil.clay}% indicates shrink-swell behavior; dry-season cracking accelerates root-zone moisture loss [${docs.findIndex((d) => d.tags.includes('vertisol')) + 1 || 1}].`
      );
      lines.push(
        `- Apply surface crop-residue mulching and minimum tillage to conserve topsoil moisture.`
      );
      lines.push('');
    }

    if (plan && plan.seasons) {
      lines.push(`**2. Localized Cultivar & 4-Season Pathway (${telemetry.selectedPathway || 'A'})**`);
      plan.seasons.forEach((s) => {
        const res = s.crop.cultivar_resolution;
        const cultivarText = s.crop.recommended_variety || res?.cultivar.cultivar_name || 'Species Archetype';
        const statusTag = res?.is_archetype_fallback
          ? 'Archetype Fallback - Verify Local Seed Registry'
          : res?.cultivar.registration_status || 'Local Cultivar';
        lines.push(`- Season ${s.seasonIndex}: **${s.crop.name_en || s.crop.name}** (*${s.crop.scientific_name || ''}*) - ${cultivarText} (${statusTag})`);
      });
      lines.push(
        `- Projected Soil Battery Score: **${plan.soilBatteryScore}%** | Water Savings: **${plan.waterSavingsPct}%**.`
      );
      lines.push('');
    }

    lines.push(`**3. Scientific Reference Grounding**`);
    lines.push(`Primary guidance from **${primaryDoc.title}** (${primaryDoc.institution}) [1].`);
    if (aez && aez.country_code !== 'ID') {
      lines.push(
        `- Note: Regional Indonesian variety references in the RAG corpus apply strictly to Indonesia (ID) and are excluded for ${aez.country}. Verify final seed procurement with national extension registries in ${aez.country}.`
      );
    }
    return lines.join('\n');
  }

  lines.push(`### Analisis Agronomi Berbasis Telemetri Lahan Aktual`);
  lines.push('');
  lines.push(
    `Berdasarkan data telemetri lahan di **${telemetry.location?.placeName || 'lokasi aktif'}** (Elevasi ${telemetry.elevation_m || 85} mdpl) dengan tekstur tanah **${soil?.textureClass || 'Lempung'}** dan pH **${soil?.ph || 6.5}**:`
  );
  lines.push('');

  // Skenario pertanyaan seputar pH / pupuk / tanah
  if (soil && soil.ph < 5.8) {
    lines.push(`**1. Evaluasi Kesuburan Kimia Tanah (Reaksi Masam)**`);
    lines.push(
      `- Tingkat kemasaman tanah saat ini berada pada pH ${soil.ph}. Menurut pedoman Balittanah [${docs.findIndex((d) => d.tags.includes('ph')) + 1 || 1}], pada pH di bawah 5.5, ketersediaan fosfat (P) terikat oleh ion aluminium.`
    );
    lines.push(
      `- Disarankan aplikasi kapur dolomit dosis 1.5 - 2.0 ton/ha yang ditebar 2-3 minggu sebelum pengolahan tanah musim hujan agar penyerapan pupuk NPK menjadi optimal.`
    );
    lines.push('');
  } else if (soil && soil.clay > 35) {
    lines.push(`**1. Karakteristik Fisik Tanah Lempung Berat**`);
    lines.push(
      `- Kandungan lempung sebesar ${soil.clay}% menandakan sifat tanah mengembang-mengerut (tipe Vertisol). Saat kemarau, tanah rentan membentuk retakan dalam yang mempercepat kekeringan akar [${docs.findIndex((d) => d.tags.includes('vertisol')) + 1 || 1}].`
    );
    lines.push(
      `- Rekomendasi: Terapkan sistem mulsa sisa panen tebal untuk menutupi pori makro dan pertahankan olah tanah minimal (Minimum Tillage).`
    );
    lines.push('');
  }

  // Rujukan teknis dokumen terpilih
  lines.push(`**2. Panduan Budidaya Berdasarkan Dokumen Acuan Resmi**`);
  lines.push(`Mengacu pada **${primaryDoc.title}** (${primaryDoc.institution}) [1]:`);
  primaryDoc.recommendations.forEach((rec) => {
    lines.push(`- ${rec}`);
  });
  lines.push('');

  if (secondaryDoc && secondaryDoc.id !== primaryDoc.id) {
    lines.push(`Catatan tambahan dari **${secondaryDoc.title}** [2]:`);
    secondaryDoc.recommendations.slice(0, 2).forEach((rec) => {
      lines.push(`- ${rec}`);
    });
    lines.push('');
  }

  // Rekomendasi Alur Rotasi
  if (plan && plan.seasons) {
    lines.push(`**3. Sinkronisasi dengan Rencana Rotasi 4 Musim (Pathway ${telemetry.selectedPathway || 'A'})**`);
    lines.push(
      `- Urutan tanam yang sedang aktif: ${plan.seasons.map((s) => `${s.crop.name} (M${s.seasonIndex})`).join(' -> ')}.`
    );
    lines.push(
      `- Pola ini menghasilkan akumulasi baterai tanah **${plan.soilBatteryScore}%** dan penghematan air hingga **${plan.waterSavingsPct}%** dibanding pola monokultur sereal berkelanjutan.`
    );
  }

  return lines.join('\n');
}
