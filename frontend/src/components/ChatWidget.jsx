import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { FiMessageSquare, FiSend } from 'react-icons/fi';
import { aiRecommendations } from '../services/mockData';

export default function ChatWidget() {
  const initialMessages = useMemo(
    () => aiRecommendations.chatbot.map((text, index) => ({ id: index + 1, type: 'bot', text })),
    [],
  );
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [value, setValue] = useState('');

  const sendMessage = () => {
    if (!value.trim()) return;
    const next = { id: Date.now(), type: 'user', text: value };
    setMessages((prev) => [...prev, next]);
    setValue('');
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'bot',
          text: 'Analyse recue. Je te conseille de prioriser les cours a fort soutien, les events ouverts et une candidature stage cette semaine.',
        },
      ]);
    }, 1200);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <AnimatePresence>
        {open ? (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15, scale: 0.98 }} className="glass-panel mb-4 flex h-[520px] w-[min(92vw,380px)] flex-col rounded-[30px] p-4">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="font-display text-lg font-semibold text-white">PIORS AI</p>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan/80">Assistant orientation</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300">Fermer</button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {messages.map((message) => (
                <div key={message.id} className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm ${message.type === 'bot' ? 'glass-panel text-slate-100' : 'ml-auto bg-gradient-to-r from-cyan to-neon text-white'}`}>
                  {message.text}
                </div>
              ))}
              {typing ? <div className="glass-panel inline-flex rounded-3xl px-4 py-3 text-sm text-slate-300">Typing...</div> : null}
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
              <input value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && sendMessage()} className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder="Pose une question sur ton orientation..." />
              <button type="button" onClick={sendMessage} className="rounded-2xl bg-gradient-to-r from-cyan to-neon p-3 text-white">
                <FiSend />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => setOpen((prev) => !prev)} className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-cyan to-neon text-2xl text-white shadow-[0_0_40px_rgba(57,208,255,0.4)]">
        <FiMessageSquare />
      </motion.button>
    </div>
  );
}