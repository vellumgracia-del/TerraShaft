import { NextResponse } from 'next/server';
import { getAppEnv } from '@/lib/env';
import {
  AGRONOMY_KNOWLEDGE_BASE,
  searchKnowledgeBase,
  KnowledgeDocument
} from '@/data/agronomyKnowledgeBase';
import { SoilData, RotationPlan } from '@/types/agronomy';
import { ClimateData, LocationCoordinates } from '@/types/climate';

interface TelemetryContext {
  location?: LocationCoordinates;
  elevation_m?: number;
  soilData?: SoilData | null;
  climateData?: ClimateData | null;
  selectedPathway?: 'A' | 'B' | 'C';
  activePlan?: RotationPlan | null;
}

interface AdvisorRequestBody {
  message?: string;
  telemetry?: TelemetryContext;
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

    // 3. Execution: If Gemini API Key exists, call Gemini REST API
    if (env.geminiApiKey) {
      try {
        const aiResponse = await callGeminiWithGrounding(
          env.geminiApiKey,
          userMessage,
          fieldSummary,
          finalDocs
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
          mode: 'gemini_grounded',
          matchedTopics: finalDocs.map((d) => d.title)
        });
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to local agronomy engine:', geminiError);
        // Fall through to deterministic agronomy response
      }
    }

    // 4. Deterministic Agronomy RAG Synthesis (Zero-hallucination baseline)
    const localAdvisory = generateDeterministicAdvisory(userMessage, telemetry, finalDocs);

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
      `Observasi Satelit NASA: Curah Hujan Tahunan ${climate.annualRainfall_mm} mm, Rata-rata Kelembapan SMAP GWETROOT: ${climate.rootZoneSoilMoisture}`
    );
  }

  if (plan && plan.seasons) {
    lines.push(
      `Skenario Rotasi Aktif (Pathway ${telemetry.selectedPathway || 'A'}): ` +
        plan.seasons.map((s) => `M${s.seasonIndex} (${s.crop.name})`).join(' -> ') +
        ` | Skor Baterai: ${plan.soilBatteryScore}%`
    );
  }

  return lines.join('\n');
}

async function callGeminiWithGrounding(
  apiKey: string,
  userMessage: string,
  telemetrySummary: string,
  docs: KnowledgeDocument[]
): Promise<string> {
  const documentsContext = docs
    .map(
      (d, i) =>
        `[Dokumen ${i + 1}] ${d.title} (${d.institution}, ${d.year})\nRangkuman: ${d.summary}\nRekomendasi Resmi:\n${d.recommendations.map((r) => `- ${r}`).join('\n')}\nSitasi: ${d.citation}`
    )
    .join('\n\n');

  const systemPrompt = `Anda adalah TerraShaft Agronomist AI, pakar agronomi dan penyuluh pertanian lahan kering presisi.
Tugas Anda: Memberikan konsultasi budidaya, pengelolaan tanah, dan mitigasi kekeringan kepada petani dan Penyuluh Pertanian Lapangan (PPL).

PANDUAN KETAT (ANTI-HALUSINASI):
1. Anda HANYA boleh menjawab berdasarkan data telemetri lapangan aktual dan dokumen acuan resmi yang disediakan.
2. Setiap kali memberikan anjuran takaran pupuk, jarak tanam, varietas, atau perlakuan tanah, cantumkan sitasi rujukan dalam tanda kurung siku seperti [1], [2] yang merujuk pada daftar dokumen.
3. Dilarang mengubah rumus atau angka matematika hasil telemetri yang telah dihitung sistem.
4. Gunakan bahasa Indonesia profesional yang jelas, terstruktur, dan aplikatif untuk petani di lapangan.
5. Jangan gunakan emoji. Jangan gunakan karakter em dash (ganti dengan tanda titik, koma, atau tanda kurung).

Konteks Telemetri Lahan Pengguna Saat Ini:
${telemetrySummary}

Basis Dokumen Acuan Resmi (RAG):
${documentsContext}`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nPertanyaan Petani/PPL:\n"${userMessage}"` }]
        }
      ],
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
  docs: KnowledgeDocument[]
): string {
  const soil = telemetry.soilData;
  const plan = telemetry.activePlan;
  const primaryDoc = docs[0];
  const secondaryDoc = docs[1] || docs[0];

  const lines: string[] = [];

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
