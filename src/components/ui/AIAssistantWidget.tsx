/**
 * AIAssistantWidget.tsx — D001: Assistente IA de Atendimento & Captação ISM
 * ────────────────────────────────────────────────────────────────────────
 * Widget flutuante de atendimento inteligente baseado nos dados institucionais do ISM.
 * Permite ao visitante tirar dúvidas sobre doações, chave Pix CNPJ, SROI, projetos e transparência.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, X, Send, Bot, User, ArrowRight, RefreshCcw } from 'lucide-react';
import { AIAgentService, type ChatMessage } from '../../services/aiAgentService';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    sender: 'assistant',
    text: 'Olá! Sou o **Assistente de Impacto do Instituto Ser Melhor**. 🌿\n\nComo posso te ajudar hoje?',
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    quickActions: [
      { label: '⚡ Como doar via Pix?', action: 'ASK_PIX' },
      { label: '📊 Qual a razão SROI do ISM?', action: 'ASK_SROI' },
      { label: '🌿 Conhecer o Projeto AURA', action: 'ASK_AURA' },
      { label: '📄 Ver Relatórios de Transparência', action: 'GOTO_TRANSPARENCY' },
    ],
  },
];

export const AIAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Simula tempo de resposta do agente de IA
    setTimeout(() => {
      const { reply, quickActions } = AIAgentService.generateReply(query);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        quickActions,
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
      AIAgentService.logInteraction(query, reply);
    }, 600);
  };

  const handleQuickAction = (action: string, label: string) => {
    switch (action) {
      case 'ASK_PIX':
        handleSendMessage('Como faço para doar via PIX?');
        break;
      case 'ASK_SROI':
        handleSendMessage('Qual o SROI e retorno social do ISM?');
        break;
      case 'ASK_AURA':
        handleSendMessage('O que é o Projeto AURA?');
        break;
      case 'OPEN_AURA':
        window.open('https://www.aura.institutosermelhor.org', '_blank', 'noopener,noreferrer');
        break;
      case 'GOTO_DONATION':
        document.getElementById('donate')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'GOTO_SROI':
        document.getElementById('sroi')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'GOTO_TRANSPARENCY':
        document.getElementById('transparency')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'GOTO_GOVERNANCE':
        document.getElementById('governance')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'GOTO_PROGRAMS':
        document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'GOTO_PILLARS':
        document.getElementById('pillars')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'GOTO_PARTNER':
        document.getElementById('partner')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'GOTO_MISSION':
        document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'GOTO_IMPACT':
        document.getElementById('impact')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'GOTO_FOOTER':
        document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
        break;
      default:
        handleSendMessage(label);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25 }}
            className="mb-4 w-[90vw] max-w-[380px] h-[520px] bg-secondary-950 border border-secondary-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl"
            role="dialog"
            aria-label="Assistente Virtual de Atendimento ISM"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-700 to-brand-600 p-4 flex items-center justify-between text-white shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Bot size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm flex items-center gap-1.5 leading-tight">
                    Assistente ISM <Sparkles size={13} className="text-brand-300" />
                  </h3>
                  <span className="text-[10px] text-brand-200 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Online · Conhecimento Oficial
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Fechar assistente de chat"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-brand-600 text-white rounded-br-none shadow-md'
                        : 'bg-secondary-900 border border-secondary-800 text-secondary-200 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>

                    {/* Quick Actions if present */}
                    {msg.quickActions && msg.quickActions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-secondary-800/80 flex flex-col gap-1.5">
                        {msg.quickActions.map((qa, i) => (
                          <button
                            key={i}
                            onClick={() => handleQuickAction(qa.action, qa.label)}
                            className="text-left px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[11px] font-bold transition-all flex items-center justify-between group"
                          >
                            <span>{qa.label}</span>
                            <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-secondary-500 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-secondary-400 bg-secondary-900 border border-secondary-800 p-3 rounded-2xl rounded-bl-none w-24">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce delay-200" />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={e => { e.preventDefault(); handleSendMessage(); }}
              className="p-3 bg-secondary-900 border-t border-secondary-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Digite sua dúvida sobre o ISM..."
                className="flex-1 bg-secondary-950 border border-secondary-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-secondary-500 outline-none focus:border-brand-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center hover:bg-brand-500 disabled:opacity-40 transition-all shadow-md"
                aria-label="Enviar mensagem"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-brand-600 to-brand-500 text-white flex items-center justify-center shadow-2xl shadow-brand-600/50 border-2 border-brand-400/40 relative group"
        aria-label={isOpen ? 'Fechar assistente' : 'Abrir assistente virtual de IA'}
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} className="animate-pulse" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-secondary-950 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          </span>
        )}
      </motion.button>
    </div>
  );
};
