import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { FiMessageSquare, FiSend } from 'react-icons/fi';
import { aiRecommendations } from '../services/mockData';
import { aiService } from '../services/aiService';

function formatBotText(text) {
  return String(text)
    .replace(/\s*(\d+\)\s+)/g, '\n$1')
    .replace(/\s*(\d+\.\s+)/g, '\n$1')
    .replace(/\s*(-\s+)/g, '\n$1')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function ChatWidget() {
  const initialMessages = useMemo(
    () => aiRecommendations.chatbot.map((text, index) => ({ id: index + 1, type: 'bot', text })),
    [],
  );
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [value, setValue] = useState('');

  useEffect(() => {
    const openAssistant = () => setOpen(true);
    window.addEventListener('piors:open-ai', openAssistant);
    return () => window.removeEventListener('piors:open-ai', openAssistant);
  }, []);

  const sendMessage = async () => {
    if (!value.trim()) return;
    const next = { id: Date.now(), type: 'user', text: value };
    setMessages((prev) => [...prev, next]);
    const currentValue = value;
    setValue('');
    setTyping(true);

    try {
      const response = await aiService.chat(currentValue, messages.slice(-8));
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'bot',
          text: response.answer || 'Je te propose de revoir tes priorites pedagogiques et de demander un suivi au formateur.',
        },
      ]);
    } catch (error) {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'bot',
          text: 'Je ne peux pas joindre le service AI maintenant. Essaie encore, ou verifie que le backend Laravel est lance.',
        },
      ]);
    }
  };

  const renderMessage = (message) => {
    if (message.type !== 'bot') return message.text;

    return (
      <div className="space-y-2 leading-6">
        {formatBotText(message.text).map((line, index) => (
          <p key={`${message.id}-${index}`}>{line}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <AnimatePresence>
        {open ? (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15, scale: 0.98 }} className="glass-panel mb-3 flex h-[460px] w-[min(92vw,340px)] flex-col rounded-[26px] p-3">
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <p className="font-display text-base font-semibold text-white">PIORS AI</p>
                <p className="text-[10px] uppercase tracking-[0.24em] text-cyan/80">Assistant orientation</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">Fermer</button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {messages.map((message) => (
                <div key={message.id} className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm ${message.type === 'bot' ? 'glass-panel text-slate-100' : 'ml-auto bg-gradient-to-r from-cyan to-neon text-white'}`}>
                  {renderMessage(message)}
                </div>
              ))}
              {typing ? <div className="glass-panel inline-flex rounded-2xl px-3.5 py-2.5 text-sm text-slate-300">Typing...</div> : null}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
              <input value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && sendMessage()} className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder="Pose une question sur ton orientation..." />
              <button type="button" onClick={sendMessage} className="rounded-xl bg-gradient-to-r from-cyan to-neon p-2.5 text-white">
                <FiSend />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => setOpen((prev) => !prev)} className="flex items-center gap-3 rounded-full bg-gradient-to-r from-cyan to-neon px-5 py-4 text-white shadow-[0_0_40px_rgba(57,208,255,0.4)]">
        <FiMessageSquare />
        <span className="hidden text-sm font-semibold sm:inline">PIORS AI</span>
      </motion.button>
    </div>
  );
}
