'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTerraShaftStore } from '@/store/useTerraShaftStore';
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
  AlertCircle,
  HelpCircle,
  FileText
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
  timestamp: string;
}

export default function AdvisoryChatSection() {
  const { location, elevation_m, soilData, climateData, selectedPathway, plans } =
    useTerraShaftStore();

  const activePlan = plans ? plans[selectedPathway] : null;

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Halo. Saya adalah **TerraShaft Agronomist AI**.

Saya terhubung langsung dengan telemetri satelit NASA (curah hujan, SMAP) dan profil tanah ISRIC untuk lahan aktif Anda di **${
        location.placeName || 'Kupang Timur'
      }**.

Silakan ajukan pertanyaan seputar rekomendasi budidaya varietas unggul, takaran pemupukan berimbang, perbaikan tanah masam/padas, atau strategi mitigasi kekeringan. Semua saran merujuk pada dokumen ilmiah resmi (BRIN, Balitkabi, Balittanah, dan FAO-56).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openCitations, setOpenCitations] = useState<Record<string, boolean>>({});

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickChips = [
    'Rekomendasi takaran pupuk dan perbaikan pH tanah ini',
    'Mengapa kelembapan SMAP kritis di musim kemarau dan apa mitigasinya?',
    'SOP jarak tanam dan pemupukan benih rotasi Musim 1',
    'Cara memecah lapisan tanah padas dan menangani tanah lempung retak'
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

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
          apiKey: customKey || undefined,
          telemetry: {
            location,
            elevation_m,
            soilData,
            climateData,
            selectedPathway,
            activePlan
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Tidak dapat memproses jawaban.',
        citations: data.citations || [],
        mode: data.mode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Maaf, terjadi kendala saat menghubungkan ke mesin agronomi. Silakan periksa koneksi internet atau coba kembali.',
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

  return (
    <div className="flex-1 flex flex-col bg-[#16191E] border border-[#282C34] rounded-[6px] overflow-hidden min-h-[620px] lg:h-[calc(100vh-8.5rem)]">
      {/* Top Banner & Telemetry Grounding Mode */}
      <div className="px-5 py-3.5 bg-[#1A1F26] border-b border-[#282C34] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[4px] bg-[#163A40] flex items-center justify-center text-[#00C2CC]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#F1F3F5] flex items-center gap-2">
              <span>Konsultasi Pakar Agronomi Lapangan</span>
              <span className="text-[10px] font-mono font-normal uppercase tracking-wider px-2 py-0.5 rounded-[3px] bg-[#122A2F] text-[#00C2CC] border border-[#164E55]">
                Grounded RAG Mode
              </span>
            </h2>
            <p className="text-xs text-[#8A949E]">
              Terintegrasi dengan telemetri riil {location.placeName || 'Lahan Aktif'} & Dokumen Ilmiah BRIN/FAO
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#9BA3AE] bg-[#121418] px-2.5 py-1 rounded-[4px] border border-[#242831]">
          <BookOpen className="w-3.5 h-3.5 text-[#00C2CC]" />
          <span>11 Basis Data SOP Ilmiah</span>
        </div>
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="px-5 py-2.5 bg-[#121519] border-b border-[#242831] flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        <span className="text-[11px] font-medium text-[#8A949E] shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-[#9BA3AE]" />
          Pertanyaan Cepat:
        </span>
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(chip)}
            disabled={isLoading}
            className="shrink-0 px-2.5 py-1 bg-[#1A1F26] hover:bg-[#232933] text-[#C1C7CD] hover:text-[#F1F3F5] rounded-[4px] border border-[#282C34] transition-colors cursor-pointer text-[11.5px]"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
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
                className={`flex gap-3 max-w-[90%] md:max-w-[85%] ${
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
                  className={`flex flex-col gap-2 rounded-[6px] p-4 text-[13px] leading-relaxed ${
                    isUser
                      ? 'bg-[#1D2530] text-[#F1F3F5] border border-[#2E3846]'
                      : 'bg-[#181C22] text-[#E2E6EA] border border-[#282C34]'
                  }`}
                >
                  {/* Sender & Timestamp */}
                  <div className="flex items-center justify-between gap-4 text-[11px] text-[#8A949E] border-b border-[#242831] pb-1.5">
                    <span className="font-medium text-[#C1C7CD]">
                      {isUser ? 'Anda (PPL / Petani)' : 'TerraShaft Agronomist AI'}
                    </span>
                    <span className="font-mono">{msg.timestamp}</span>
                  </div>

                  {/* Body Text with basic markdown representation */}
                  <div className="whitespace-pre-line space-y-2">
                    {msg.text.split('\n\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('### ')) {
                        return (
                          <h4
                            key={pIdx}
                            className="font-semibold text-sm text-[#00C2CC] border-b border-[#242831] pb-1 mt-2"
                          >
                            {paragraph.replace('### ', '')}
                          </h4>
                        );
                      }
                      if (paragraph.startsWith('**') && paragraph.includes('**\n')) {
                        return (
                          <div key={pIdx} className="font-medium text-[#F1F3F5]">
                            {paragraph}
                          </div>
                        );
                      }
                      return <p key={pIdx}>{paragraph}</p>;
                    })}
                  </div>

                  {/* Citations Box (RAG Grounding Transparency) */}
                  {!isUser && hasCitations && (
                    <div className="mt-2 pt-2 border-t border-[#242831] flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleCitation(msg.id)}
                        className="flex items-center justify-between text-xs text-[#9BA3AE] hover:text-[#00C2CC] transition-colors py-1 cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 font-medium">
                          <FileText className="w-3.5 h-3.5 text-[#00C2CC]" />
                          <span>{msg.citations!.length} Sumber Ilmiah Tervalidasi</span>
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
                                Rujukan: {cit.citation}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Bar (Copy to WhatsApp) */}
                  {!isUser && (
                    <div className="mt-1 flex items-center justify-end gap-2 border-t border-[#242831] pt-2">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(msg.id, msg.text)}
                        className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#14181E] hover:bg-[#20252D] text-[#9BA3AE] hover:text-[#F1F3F5] rounded-[3px] border border-[#242831] text-[11px] transition-colors cursor-pointer"
                        title="Salin ringkasan ke format WhatsApp"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-[#34D399]" />
                            <span className="text-[#34D399]">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin ke WhatsApp</span>
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

        {isLoading && (
          <div className="flex items-center gap-3 text-xs text-[#8A949E] py-2">
            <div className="w-7 h-7 rounded-[4px] bg-[#163A40] flex items-center justify-center text-[#00C2CC] animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <span>Mencari dokumen acuan BRIN/FAO dan menyintesis data telemetri...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Message Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-[#1A1F26] border-t border-[#282C34] flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Tanyakan rekomendasi pemupukan, varietas unggul, atau pengelolaan tanah..."
          disabled={isLoading}
          className="flex-1 bg-[#121418] border border-[#282C34] focus:border-[#00C2CC] focus:ring-0 rounded-[4px] px-3 py-2 text-xs text-[#F1F3F5] placeholder-[#6C757D] outline-none transition-colors"
        />

        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="px-4 py-2 bg-[#00C2CC] hover:bg-[#33D4DC] disabled:bg-[#20252D] disabled:text-[#6C757D] text-[#121418] font-semibold rounded-[4px] text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Kirim</span>
        </button>
      </form>
    </div>
  );
}
