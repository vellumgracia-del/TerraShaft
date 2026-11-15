'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
import { useAppI18n } from '@/lib/i18n';
import { AGRONOMY_KNOWLEDGE_BASE } from '@/data/agronomyKnowledgeBase';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  BookOpen,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  FileText,
  RotateCcw,
  KeyRound,
  Cpu,
  ArrowUpRight
} from 'lucide-react';

interface CitationItem {
  index: number;
  id: string;
  title: string;
  institution: string;
  year: number;
  citation: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: CitationItem[];
  mode?: string;
  model?: string;
  timestamp: string;
}

const CHAT_STORAGE_KEY = 'terrashaft_advisor_chat_v1';

function renderInlineMarkdown(text: string): React.ReactNode[] {
  // Match **bold**, *italic*, or [citation] tokens
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[\d+\])/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-[#F1F3F5]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={idx} className="italic text-[#C1C7CD]">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (/^\[\d+\]$/.test(part)) {
      return (
        <span
          key={idx}
          className="inline-flex items-center px-1 py-0.2 mx-0.5 rounded-[3px] bg-[#122A2F] text-[#00C2CC] border border-[#164E55] font-mono text-[10.5px] align-baseline"
        >
          {part}
        </span>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function renderMessageBody(text: string): React.ReactNode {
  const blocks = text.split(/\n{2,}/);

  return (
    <div className="space-y-2.5">
      {blocks.map((block, bIdx) => {
        const lines = block.split('\n').filter((l) => l.trim() !== '');
        if (lines.length === 0) return null;

        if (lines.length === 1 && lines[0].startsWith('### ')) {
          return (
            <h4
              key={bIdx}
              className="font-semibold text-[13.5px] text-[#00C2CC] border-b border-[#242831] pb-1 mt-1"
            >
              {lines[0].replace(/^###\s+/, '')}
            </h4>
          );
        }

        const isBulletBlock = lines.every((l) => /^[-*]\s+/.test(l.trim()));
        if (isBulletBlock) {
          return (
            <ul key={bIdx} className="list-disc pl-4 space-y-1 text-[#DCE1E7]">
              {lines.map((line, lIdx) => (
                <li key={lIdx}>{renderInlineMarkdown(line.trim().replace(/^[-*]\s+/, ''))}</li>
              ))}
            </ul>
          );
        }

        const isOrderedBlock = lines.every((l) => /^\d+\.\s+/.test(l.trim()));
        if (isOrderedBlock) {
          return (
            <ol key={bIdx} className="list-decimal pl-4 space-y-1 text-[#DCE1E7]">
              {lines.map((line, lIdx) => (
                <li key={lIdx}>{renderInlineMarkdown(line.trim().replace(/^\d+\.\s+/, ''))}</li>
              ))}
            </ol>
          );
        }

        return (
          <div key={bIdx} className="space-y-1">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (trimmed.startsWith('### ')) {
                return (
                  <h4
                    key={lIdx}
                    className="font-semibold text-[13.5px] text-[#00C2CC] border-b border-[#242831] pb-1 mt-1"
                  >
                    {trimmed.replace(/^###\s+/, '')}
                  </h4>
                );
              }
              if (/^[-*]\s+/.test(trimmed)) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1">
                    <span className="text-[#00C2CC] mt-1 text-[10px]">●</span>
                    <span>{renderInlineMarkdown(trimmed.replace(/^[-*]\s+/, ''))}</span>
                  </div>
                );
              }
              return <p key={lIdx}>{renderInlineMarkdown(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function AdvisoryChatSection() {
  const { location, elevation_m, soilData, climateData, selectedPathway, plans, agroecologicalProfile } =
    useTerraShaftStore();
  const { locale, isEn } = useAppI18n();

  const activePlan = plans ? plans[selectedPathway] : null;

  const createWelcomeMessage = (): ChatMessage => ({
    id: 'welcome',
    sender: 'assistant',
    text: isEn
      ? `Hello. I am **TerraShaft Agronomist AI**.\n\nI am grounded directly in active NASA POWER climate telemetry, ISRIC SoilGrids v2.0 topsoil fractions, and global AEZ cultivar localization for **${
          location.placeName || 'your selected plot'
        }** (${agroecologicalProfile.country}, ${agroecologicalProfile.agroecological_zone}).\n\nAsk about site-specific crop rotation, soil pH/texture management, drought mitigation, or local cultivar suitability.`
      : `Halo. Saya adalah **TerraShaft Agronomist AI**.\n\nSaya terhubung langsung dengan telemetri satelit NASA (curah hujan, SMAP) dan profil tanah ISRIC SoilGrids v2.0 untuk lahan aktif Anda di **${
          location.placeName || 'Kupang Timur'
        }** (${agroecologicalProfile.country}, ${agroecologicalProfile.agroecological_zone}).\n\nSilakan ajukan pertanyaan seputar rekomendasi kultivar terlokalisasi, takaran pemupukan berimbang, perbaikan tanah masam, atau strategi mitigasi kekeringan.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => [createWelcomeMessage()]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openCitations, setOpenCitations] = useState<Record<string, boolean>>({});
  const [showQuickPrompts, setShowQuickPrompts] = useState(false);
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const messageSeqRef = useRef(1);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('terrashaft_gemini_key');
      setHasCustomKey(Boolean(savedKey && savedKey.trim().length > 0));

      const rawChat = sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (rawChat) {
        const parsed = JSON.parse(rawChat) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          messageSeqRef.current = parsed.length + 1;
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore storage errors
    }
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickChips = isEn
    ? [
        'Recommended fertilizer & pH management for this soil profile',
        'Why does root-zone moisture drop in dry season and how do we mitigate it?',
        'Explain localized cultivar vs phenotype fallback choices for Season 1',
        'How should heavy clay or low-AWC soils be prepared for rainfed planting?'
      ]
    : [
        'Rekomendasi takaran pupuk dan perbaikan pH tanah ini',
        'Mengapa kelembapan SMAP kritis di musim kemarau dan apa mitigasinya?',
        'Jelaskan pemilihan kultivar lokal vs fallback arketipe untuk Musim 1',
        'Cara menangani tanah lempung berat atau AWC rendah saat tadah hujan'
      ];

  const handleResetChat = () => {
    const fresh = [createWelcomeMessage()];
    setMessages(fresh);
    setOpenCitations({});
    setShowQuickPrompts(false);
    try {
      sessionStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    setShowQuickPrompts(false);

    const userMsg: ChatMessage = {
      id: `user-${messageSeqRef.current++}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const historyPayload = messages
      .filter((m) => m.id !== 'welcome' && !m.id.startsWith('err-'))
      .slice(-6)
      .map((m) => ({ sender: m.sender, text: m.text }));

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      let customKey: string | null = null;
      try {
        customKey = localStorage.getItem('terrashaft_gemini_key');
      } catch {
        // ignore
      }

      const response = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          locale,
          apiKey: customKey || undefined,
          telemetry: {
            location,
            elevation_m,
            soilData,
            climateData,
            selectedPathway,
            activePlan,
            agroecologicalProfile
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${messageSeqRef.current++}`,
        sender: 'assistant',
        text: data.reply || (isEn ? 'Unable to process response.' : 'Tidak dapat memproses jawaban.'),
        citations: data.citations || [],
        mode: data.mode,
        model: data.model,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${messageSeqRef.current++}`,
        sender: 'assistant',
        text: isEn
          ? 'Sorry, failed to connect to the agronomy engine. Please check your connection and try again.'
          : 'Maaf, terjadi kendala saat menghubungkan ke mesin agronomi. Silakan periksa koneksi internet atau coba kembali.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const toggleCitation = (msgId: string) => {
    setOpenCitations((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const showInlineSuggestions = messages.length <= 1;

  return (
    <div className="flex-1 min-h-0 h-[72vh] lg:h-full flex flex-col bg-[#16191E] border border-[#282C34] rounded-[6px] overflow-hidden relative">
      {/* Top Banner & Telemetry Grounding Mode */}
      <div className="shrink-0 px-4 py-2.5 bg-[#1A1F26] border-b border-[#282C34] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-[4px] bg-[#163A40] flex items-center justify-center text-[#00C2CC] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-semibold text-[#F1F3F5] flex items-center gap-2">
              <span className="truncate">
                {isEn ? 'Field Agronomy Consultation' : 'Konsultasi Pakar Agronomi Lapangan'}
              </span>
              <span className="text-[10px] font-mono font-normal uppercase tracking-wider px-1.5 py-0.5 rounded-[3px] bg-[#122A2F] text-[#00C2CC] border border-[#164E55] shrink-0">
                Grounded RAG
              </span>
            </h2>
            <p className="text-[11px] text-[#8A949E] truncate">
              {location.placeName || (isEn ? 'Active Plot' : 'Lahan Aktif')} · {agroecologicalProfile.agroecological_zone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href="/settings"
            title={isEn ? 'Configure Gemini API Key' : 'Atur Kunci API Gemini'}
            className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-[4px] border transition-colors ${
              hasCustomKey
                ? 'bg-[#064E3B]/40 text-[#34D399] border-[#047857]/60 hover:bg-[#064E3B]/60'
                : 'bg-[#121418] text-[#9BA3AE] border-[#242831] hover:text-[#F1F3F5]'
            }`}
          >
            <KeyRound className="w-3 h-3" />
            <span className="hidden sm:inline">
              {hasCustomKey ? 'BYOK Active' : 'API Key'}
            </span>
          </Link>

          <Link
            href="/data-sources?tab=rag-sop"
            title={isEn ? 'View RAG SOP documents in Data Sources' : 'Lihat daftar dokumen SOP RAG di Sumber Data'}
            className="inline-flex items-center gap-1.5 text-[11px] text-[#9BA3AE] hover:text-[#F1F3F5] bg-[#121418] hover:bg-[#1E232B] px-2 py-1 rounded-[4px] border border-[#242831] hover:border-[#00C2CC]/50 transition-colors"
          >
            <BookOpen className="w-3 h-3 text-[#00C2CC]" />
            <span>
              {AGRONOMY_KNOWLEDGE_BASE.length} {isEn ? 'SOP Docs' : 'SOP Ilmiah'}
            </span>
            <ArrowUpRight className="w-3 h-3 text-[#6C757D]" />
          </Link>

          <button
            type="button"
            onClick={handleResetChat}
            title={isEn ? 'Reset conversation' : 'Mulai ulang percakapan'}
            className="inline-flex items-center gap-1 text-[11px] text-[#9BA3AE] hover:text-[#F1F3F5] bg-[#121418] hover:bg-[#20252D] px-2 py-1 rounded-[4px] border border-[#242831] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">{isEn ? 'Reset' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Log (Internal Scroll Only) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3.5">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const hasCitations = msg.citations && msg.citations.length > 0;
          const isCitationsOpen = openCitations[msg.id];

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div
                className={`flex gap-2.5 max-w-[92%] md:max-w-[85%] ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-7 h-7 rounded-[4px] shrink-0 flex items-center justify-center text-xs ${
                    isUser
                      ? 'bg-[#20252D] text-[#C1C7CD] border border-[#2E3540]'
                      : 'bg-[#163A40] text-[#00C2CC] border border-[#164E55]'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Content */}
                <div
                  className={`flex flex-col gap-2 rounded-[6px] p-3.5 text-[13px] leading-relaxed ${
                    isUser
                      ? 'bg-[#1D2530] text-[#F1F3F5] border border-[#2E3846]'
                      : 'bg-[#181C22] text-[#E2E6EA] border border-[#282C34]'
                  }`}
                >
                  {/* Sender, Mode Badge & Timestamp */}
                  <div className="flex items-center justify-between gap-3 text-[11px] text-[#8A949E] border-b border-[#242831] pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#C1C7CD]">
                        {isUser
                          ? isEn ? 'You (Agronomist / Grower)' : 'Anda (PPL / Petani)'
                          : 'TerraShaft Agronomist AI'}
                      </span>
                      {!isUser && msg.mode && (
                        <span
                          className={`inline-flex items-center gap-1 text-[9.5px] font-mono px-1.5 py-0.5 rounded-[3px] border ${
                            msg.mode === 'gemini_grounded' || msg.mode === 'deepseek_grounded'
                              ? 'bg-[#064E3B]/40 text-[#34D399] border-[#047857]/60'
                              : 'bg-[#122A2F] text-[#00C2CC] border-[#164E55]'
                          }`}
                        >
                          <Cpu className="w-2.5 h-2.5" />
                          <span>
                            {msg.mode === 'gemini_grounded' || msg.mode === 'deepseek_grounded'
                              ? msg.model || 'LLM Grounded'
                              : 'Deterministic RAG'}
                          </span>
                        </span>
                      )}
                    </div>
                    <span className="font-mono">{msg.timestamp}</span>
                  </div>

                  {/* Formatted Markdown Body */}
                  {renderMessageBody(msg.text)}

                  {/* Citations Box */}
                  {!isUser && hasCitations && (
                    <div className="mt-1 pt-2 border-t border-[#242831] flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleCitation(msg.id)}
                        className="flex items-center justify-between text-xs text-[#9BA3AE] hover:text-[#00C2CC] transition-colors py-0.5 cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 font-medium">
                          <FileText className="w-3.5 h-3.5 text-[#00C2CC]" />
                          <span>
                            {msg.citations!.length}{' '}
                            {isEn ? 'Validated Scientific Sources' : 'Sumber Ilmiah Tervalidasi'}
                          </span>
                        </span>
                        {isCitationsOpen ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isCitationsOpen && (
                        <div className="flex flex-col gap-2 mt-1 p-2.5 bg-[#121418] rounded-[4px] border border-[#242831] text-[11.5px]">
                          {msg.citations!.map((cit) => (
                            <div key={cit.id} className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1 text-[#00C2CC] font-semibold">
                                <span>[{cit.index}]</span>
                                <span>{cit.title}</span>
                              </div>
                              <div className="text-[#8A949E] pl-4">
                                {cit.institution} ({cit.year})
                              </div>
                              <div className="text-[#6C757D] font-mono text-[10.5px] pl-4">
                                {isEn ? 'Reference:' : 'Rujukan:'} {cit.citation}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Bar */}
                  {!isUser && (
                    <div className="mt-0.5 flex items-center justify-end gap-2 border-t border-[#242831] pt-1.5">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(msg.id, msg.text)}
                        className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#14181E] hover:bg-[#20252D] text-[#9BA3AE] hover:text-[#F1F3F5] rounded-[3px] border border-[#242831] text-[11px] transition-colors cursor-pointer"
                        title={isEn ? 'Copy summary for WhatsApp' : 'Salin ringkasan ke format WhatsApp'}
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-[#34D399]" />
                            <span className="text-[#34D399]">{isEn ? 'Copied' : 'Tersalin'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{isEn ? 'Copy for WhatsApp' : 'Salin ke WhatsApp'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Inline 2x2 Quick Prompts Grid on Initial Empty State (No Horizontal Scroll) */}
        {showInlineSuggestions && !isLoading && (
          <div className="mt-1 pl-9 max-w-[92%] md:max-w-[85%]">
            <div className="text-[11px] font-medium text-[#8A949E] mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#00C2CC]" />
              <span>{isEn ? 'Suggested Field Questions' : 'Pertanyaan Cepat Lapangan'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip)}
                  className="text-left px-3 py-2.5 bg-[#1A1F26] hover:bg-[#222832] text-[#C1C7CD] hover:text-[#F1F3F5] rounded-[5px] border border-[#282C34] hover:border-[#00C2CC]/50 transition-colors cursor-pointer text-[11.5px] leading-snug"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-3 text-xs text-[#8A949E] py-1">
            <div className="w-7 h-7 rounded-[4px] bg-[#163A40] flex items-center justify-center text-[#00C2CC] animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <span>
              {isEn
                ? 'Searching BRIN/FAO references and synthesizing field telemetry...'
                : 'Mencari dokumen acuan BRIN/FAO dan menyintesis data telemetri...'}
            </span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* On-Demand Quick Prompts Drawer above Input when Chat Already Started */}
      {showQuickPrompts && !showInlineSuggestions && (
        <div className="shrink-0 px-4 py-2.5 bg-[#121519] border-t border-[#242831]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-[#9BA3AE] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#00C2CC]" />
              <span>{isEn ? 'Quick Field Questions' : 'Pertanyaan Cepat'}</span>
            </span>
            <button
              type="button"
              onClick={() => setShowQuickPrompts(false)}
              className="text-[11px] text-[#8A949E] hover:text-[#F1F3F5] cursor-pointer"
            >
              {isEn ? 'Close' : 'Tutup'}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                disabled={isLoading}
                className="text-left px-2.5 py-1.5 bg-[#1A1F26] hover:bg-[#232933] text-[#C1C7CD] hover:text-[#F1F3F5] rounded-[4px] border border-[#282C34] transition-colors cursor-pointer text-[11px] leading-snug"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Message Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="shrink-0 p-3 bg-[#1A1F26] border-t border-[#282C34] flex items-center gap-2"
      >
        {!showInlineSuggestions && (
          <button
            type="button"
            onClick={() => setShowQuickPrompts((prev) => !prev)}
            title={isEn ? 'Quick questions' : 'Pertanyaan cepat'}
            className={`p-2 rounded-[4px] border transition-colors cursor-pointer shrink-0 ${
              showQuickPrompts
                ? 'bg-[#163A40] text-[#00C2CC] border-[#164E55]'
                : 'bg-[#121418] text-[#9BA3AE] hover:text-[#F1F3F5] border-[#282C34]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isEn
              ? 'Ask about fertilizer dosing, cultivar suitability, or soil management...'
              : 'Tanyakan rekomendasi pemupukan, varietas unggul, atau pengelolaan tanah...'
          }
          disabled={isLoading}
          className="flex-1 bg-[#121418] border border-[#282C34] focus:border-[#00C2CC] focus:ring-0 rounded-[4px] px-3 py-2 text-xs text-[#F1F3F5] placeholder-[#6C757D] outline-none transition-colors"
        />

        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="px-4 py-2 bg-[#00C2CC] hover:bg-[#33D4DC] disabled:bg-[#20252D] disabled:text-[#6C757D] text-[#121418] font-semibold rounded-[4px] text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isEn ? 'Send' : 'Kirim'}</span>
        </button>
      </form>
    </div>
  );
}
