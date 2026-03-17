'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Users, 
  Trophy, 
  AlertTriangle, 
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Settings,
  CheckCircle2,
  Bomb,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db, auth } from '@/firebase';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc,
  collection,
  addDoc
} from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import Image from 'next/image';

// --- Types ---
type Hour = 1 | 2 | 3 | 4 | 5;

interface SessionState {
  currentHour: Hour;
  activePollId?: string;
}

interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: Record<number, number>;
  active: boolean;
}

// --- Components ---

const ProgressBar = ({ currentHour }: { currentHour: Hour }) => {
  const progress = (currentHour / 5) * 100;
  return (
    <div className="fixed top-0 left-0 w-full h-2 bg-zinc-800 z-50">
      <motion.div 
        className="h-full bg-green-500 shadow-[0_0_10px_#22c55e]"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
      />
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-white/10">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Sopravvivenza:</span>
        <span className="text-xs font-bold text-green-400">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

const Hour1 = () => {
  const [started, setStarted] = useState(false);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'polls', 'hour1_poll'), (snapshot) => {
      if (snapshot.exists()) {
        setPoll({ id: snapshot.id, ...snapshot.data() } as Poll);
      } else {
        setDoc(doc(db, 'polls', 'hour1_poll'), {
          question: "La tua vita vale più dell'azienda?",
          options: ["Sì (Basato)", "No (Schiavo)", "Dipende dal caffè"],
          votes: { 0: 0, 1: 0, 2: 0 },
          active: true
        });
      }
    });
    return unsub;
  }, []);

  const handleVote = async (index: number) => {
    if (voted || !poll) return;
    const newVotes = { ...poll.votes };
    newVotes[index] = (newVotes[index] || 0) + 1;
    await updateDoc(doc(db, 'polls', 'hour1_poll'), { votes: newVotes });
    setVoted(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative group cursor-pointer"
          onClick={() => setStarted(true)}
        >
          <div className="absolute -inset-4 bg-green-500/20 blur-xl group-hover:bg-green-500/40 transition-all rounded-full" />
          <div className="relative bg-zinc-900 border-2 border-green-500 p-8 rounded-2xl shadow-2xl">
            <Play className="w-20 h-20 text-green-500 fill-green-500 mb-4 mx-auto" />
            <h1 className="text-4xl font-display font-black uppercase tracking-tighter mb-2">Inizia Lezione Chaos Corp!</h1>
            <p className="text-zinc-400 font-medium">Preparati al peggio. 🚀😂</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <section className="space-y-6">
        <div className="aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
          <iframe 
            className="w-full h-full"
            src="https://www.youtube.com/embed/V88Hc_taOYo?autoplay=0&mute=1&controls=1" 
            title="Office Fails"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
          <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase animate-pulse">LIVE FAIL</div>
        </div>
        
        <div className="bg-zinc-900/50 p-8 rounded-2xl border border-white/5 backdrop-blur">
          <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
            <AlertTriangle className="text-yellow-500" /> Il Caos Primordiale
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center">
            <div className="space-y-2">
              <div className="text-4xl">👑</div>
              <p className="text-sm font-bold text-zinc-400">Capo Pigro</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full h-1 bg-zinc-800 relative">
                <motion.div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl"
                  animate={{ x: [-20, 20, -20] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  📦
                </motion.div>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-4">Input / Output</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl">😴</div>
              <p className="text-sm font-bold text-zinc-400">Dipendente</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-green-500/10 p-8 rounded-2xl border border-green-500/20">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MessageSquare className="text-green-500" /> Poll Live: La Verità
        </h3>
        {poll ? (
          <div className="space-y-4">
            <p className="text-lg font-medium mb-6">{poll.question}</p>
            <div className="grid gap-3">
              {poll.options.map((opt, i) => {
                const totalVotes = Object.values(poll.votes).reduce((a, b) => a + b, 0);
                const percentage = totalVotes > 0 ? ((poll.votes[i] || 0) / totalVotes) * 100 : 0;
                return (
                  <button
                    key={i}
                    onClick={() => handleVote(i)}
                    disabled={voted}
                    className={`relative w-full p-4 rounded-xl border transition-all text-left overflow-hidden ${
                      voted ? 'border-white/10 cursor-default' : 'border-green-500/30 hover:bg-green-500/10'
                    }`}
                  >
                    <motion.div 
                      className="absolute left-0 top-0 h-full bg-green-500/20"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                    />
                    <div className="relative flex justify-between items-center">
                      <span className="font-bold">{opt}</span>
                      {voted && <span className="text-xs font-mono">{Math.round(percentage)}%</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-zinc-500 italic">In attesa del Boss...</p>
        )}
      </section>
    </div>
  );
};

const Hour2 = () => {
  const [items] = useState([
    { id: 'ceo', label: 'CEO Golfista 🏌️‍♂️', level: 0 },
    { id: 'manager', label: 'Manager Urli 📢', level: 1 },
    { id: 'ops', label: 'Operativi Meme 💻', level: 2 },
  ]);
  const [placed, setPlaced] = useState<Record<string, number>>({});
  const [meteors, setMeteors] = useState<{ id: number; x: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMeteors(prev => [...prev.slice(-10), { id: Date.now(), x: Math.random() * 100 }]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handlePlace = (id: string, level: number) => {
    setPlaced(prev => ({ ...prev, [id]: level }));
    if (Object.keys(placed).length === 2) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {meteors.map(m => (
            <motion.div
              key={m.id}
              initial={{ y: -100, opacity: 1 }}
              animate={{ y: 1000, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, ease: "linear" }}
              className="absolute text-4xl"
              style={{ left: `${m.x}%` }}
            >
              ☄️
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-3xl font-display font-black uppercase italic">Piramide Magica</h2>
        <p className="text-zinc-400">Trascina i boss al loro posto prima che arrivi un meteorite!</p>
      </div>

      <div className="flex flex-col items-center gap-8">
        <div className="w-full max-w-md space-y-4">
          {[0, 1, 2].map(level => (
            <div 
              key={level}
              className={`h-24 border-2 border-dashed rounded-2xl flex items-center justify-center transition-all ${
                Object.values(placed).includes(level) ? 'border-green-500 bg-green-500/5' : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {Object.entries(placed).find(([, l]) => l === level) ? (
                <motion.div 
                  initial={{ scale: 0.5 }} 
                  animate={{ scale: 1 }}
                  className="bg-zinc-900 px-6 py-3 rounded-xl border border-green-500 font-bold shadow-lg"
                >
                  {items.find(i => i.id === Object.entries(placed).find(([, l]) => l === level)![0])?.label}
                </motion.div>
              ) : (
                <span className="text-zinc-600 font-bold uppercase tracking-widest text-xs">
                  {level === 0 ? 'Top Management' : level === 1 ? 'Middle Management' : 'Operativi'}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {items.filter(i => !placed[i.id]).map(item => (
            <button
              key={item.id}
              onClick={() => handlePlace(item.id, item.level)}
              className="bg-zinc-900 border border-white/10 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-xl active:scale-95"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Hour3 = () => {
  const [war, setWar] = useState<string | null>(null);

  const tribes = [
    { id: 'prod', name: 'Produzione 💥', color: 'bg-orange-500', msg: 'La pizza è bruciata? Colpa del Marketing!' },
    { id: 'mktg', name: 'Marketing 📣', color: 'bg-blue-500', msg: 'Nessuno la compra? La produzione fa schifo!' },
    { id: 'sales', name: 'Vendite 💰', color: 'bg-green-500', msg: 'Provvigioni? Datemi i soldi e basta!' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-display font-black uppercase">Cellule Vive (Dipartimenti)</h2>
        <p className="text-zinc-400">Clicca sui dipartimenti per scatenare la guerra civile aziendale.</p>
      </div>

      <div className="relative h-[400px] flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <line x1="20%" y1="50%" x2="50%" y2="20%" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="80%" y1="50%" x2="50%" y2="20%" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="20%" y1="50%" x2="80%" y2="50%" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
        </svg>

        <div className="grid grid-cols-3 gap-8 w-full">
          {tribes.map(t => (
            <div key={t.id} className="flex flex-col items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setWar(t.id)}
                className={`${t.color} w-24 h-24 rounded-full flex items-center justify-center text-3xl shadow-2xl border-4 border-white/20`}
              >
                {t.id === 'prod' ? '🏭' : t.id === 'mktg' ? '🎨' : '💸'}
              </motion.button>
              <span className="font-black uppercase text-xs tracking-widest">{t.name}</span>
              
              <AnimatePresence>
                {war === t.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="bg-white text-black p-3 rounded-2xl rounded-tl-none text-[10px] font-bold absolute -top-12 shadow-xl z-10 max-w-[120px]"
                  >
                    {t.msg}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">Video Correlato: Marketing vs Produzione</h3>
        <div className="aspect-video rounded-xl overflow-hidden">
          <iframe 
            className="w-full h-full"
            src="https://www.youtube.com/embed/V88Hc_taOYo?start=60&autoplay=0&mute=1" 
            title="Office Fails 2"
          />
        </div>
      </div>
    </div>
  );
};

const Hour4 = () => {
  const [resolved, setResolved] = useState<string[]>([]);
  const crises = [
    { id: 'server', title: 'Server in Fiamme 🔥', desc: 'Qualcuno ha usato il server come scalda-pizzette.' },
    { id: 'coffee', title: 'Caffè Esaurito ☕', desc: 'Rivolta imminente al piano 3. Livello minaccia: Rosso.' },
    { id: 'logo', title: 'Logo più Grande 📐', desc: 'Il CEO vuole il logo così grande da coprire il sito.' },
  ];

  const handleResolve = (id: string) => {
    if (!resolved.includes(id)) {
      setResolved([...resolved, id]);
      confetti({ particleCount: 30, spread: 50 });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-display font-black uppercase">Dashboard Gestione Crisi</h2>
        <p className="text-zinc-400">Risolvi le emergenze prima che l&apos;azienda imploda (di nuovo).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {crises.map(c => (
          <motion.button
            key={c.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleResolve(c.id)}
            className={`p-6 rounded-2xl border-2 transition-all text-left space-y-4 ${
              resolved.includes(c.id) 
                ? 'border-green-500 bg-green-500/10 opacity-60' 
                : 'border-red-500/30 bg-red-500/5 hover:border-red-500'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-black uppercase text-sm tracking-tighter">{c.title}</span>
              {resolved.includes(c.id) && <CheckCircle2 className="text-green-500 w-5 h-5" />}
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">{c.desc}</p>
            <div className="pt-2">
              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                resolved.includes(c.id) ? 'bg-green-500 text-black' : 'bg-red-500 text-white animate-pulse'
              }`}>
                {resolved.includes(c.id) ? 'Risolto' : 'Critico'}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {resolved.length === 3 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 p-8 rounded-3xl border border-green-500/30 text-center"
        >
          <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold uppercase">Crisi Sventate!</h3>
          <p className="text-zinc-400 text-sm">Hai salvato la giornata. Il CEO ti premierà con una pacca sulla spalla.</p>
        </motion.div>
      )}
    </div>
  );
};

const Hour5 = ({ user }: { user: User | null }) => {
  const [score, setScore] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [finished, setFinished] = useState(false);

  const quiz = [
    { q: "Qual è il segreto di un organigramma perfetto?", a: ["Nascondere chi comanda davvero", "Usare tanti colori", "Non farlo proprio"], correct: 0 },
    { q: "Se un dipartimento non risponde, cosa fai?", a: ["Mandami una mail", "Dai la colpa al Marketing", "Piangi in bagno"], correct: 1 },
    { q: "Chi è il vero eroe dell'ufficio?", a: ["Il CEO", "La macchinetta del caffè", "Il tizio dell'IT"], correct: 1 },
  ];

  const saveResult = async (finalScore: number) => {
    try {
      await addDoc(collection(db, 'quizResults'), {
        studentName: user?.displayName || user?.email || "Anonimo",
        score: finalScore,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Errore nel salvataggio del risultato:", error);
    }
  };

  const handleAnswer = (idx: number) => {
    let newScore = score;
    if (idx === quiz[currentQ].correct) {
      newScore = score + 1;
      setScore(newScore);
      confetti({ colors: ['#22c55e'] });
    }
    if (currentQ < quiz.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setFinished(true);
      saveResult(newScore);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-display font-black uppercase">Il Grande Test del Caos</h2>
        <p className="text-zinc-400">Dimostra di aver capito come (non) funziona un&apos;azienda.</p>
      </div>

      {!finished ? (
        <motion.div 
          key={currentQ}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-zinc-900 p-8 rounded-3xl border border-white/5 space-y-8"
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Domanda {currentQ + 1}/{quiz.length}</span>
            <div className="flex gap-1">
              {quiz.map((item, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i <= currentQ ? 'bg-green-500' : 'bg-zinc-800'}`} />
              ))}
            </div>
          </div>
          <p className="text-2xl font-bold leading-tight">{quiz[currentQ].q}</p>
          <div className="grid grid-cols-1 gap-4">
            {quiz[currentQ].a.map((ans, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className="p-4 rounded-xl bg-zinc-800 hover:bg-green-500 hover:text-black font-bold transition-all text-left flex justify-between items-center group"
              >
                {ans}
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-zinc-900 p-12 rounded-3xl border-2 border-green-500 text-center space-y-6"
        >
          <Trophy className="w-24 h-24 text-yellow-500 mx-auto animate-bounce" />
          <h3 className="text-4xl font-display font-black uppercase">Superstite Certificato!</h3>
          <p className="text-zinc-400 text-lg">Hai completato la lezione Chaos Corp senza licenziarti.</p>
          <div className="text-6xl font-black text-green-500">{score}/{quiz.length}</div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-white text-black font-black px-10 py-4 rounded-full hover:scale-105 transition-all"
          >
            RICOMINCIA IL CAOS
          </button>
        </motion.div>
      )}
    </div>
  );
};

const AdminPanel = ({ currentHour, setHour }: { currentHour: Hour; setHour: (h: Hour) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  const nextHour = () => {
    if (currentHour < 5) setHour((currentHour + 1) as Hour);
  };

  const prevHour = () => {
    if (currentHour > 1) setHour((currentHour - 1) as Hour);
  };

  return (
    <div className="fixed bottom-24 right-4 z-[100] flex flex-col gap-2">
      <div className="flex flex-col gap-2 bg-zinc-900/80 backdrop-blur p-2 rounded-full border border-white/10 shadow-2xl">
        <button 
          onClick={prevHour}
          disabled={currentHour === 1}
          className="p-3 rounded-full hover:bg-white/10 transition-all disabled:opacity-30"
          title="Ora Precedente"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={nextHour}
          disabled={currentHour === 5}
          className="p-3 rounded-full bg-green-500 text-black hover:scale-110 transition-all disabled:opacity-30"
          title="Prossima Ora"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-zinc-900 p-3 rounded-full border border-white/10 shadow-2xl hover:bg-zinc-800 transition-all self-end"
      >
        <Settings className={`w-6 h-6 ${isOpen ? 'rotate-90' : ''} transition-transform`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-32 right-0 bg-zinc-900 border border-white/10 p-4 rounded-2xl shadow-2xl w-48 space-y-2"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Vai all&apos;Ora...</p>
            {[1, 2, 3, 4, 5].map(h => (
              <button
                key={h}
                onClick={() => {
                  setHour(h as Hour);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  currentHour === h ? 'bg-green-500 text-black' : 'hover:bg-white/5'
                }`}
              >
                Ora {h}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ChaosCorpApp() {
  const [session, setSession] = useState<SessionState>({ currentHour: 1 });
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });

    const unsubSession = onSnapshot(doc(db, 'session', 'state'), (snapshot) => {
      if (snapshot.exists()) {
        setSession(snapshot.data() as SessionState);
      } else {
        // Initialize state if not exists
        setDoc(doc(db, 'session', 'state'), { currentHour: 1 });
      }
    });

    return () => {
      unsubAuth();
      unsubSession();
    };
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const setHour = async (h: Hour) => {
    await updateDoc(doc(db, 'session', 'state'), { currentHour: h });
  };

  if (!isAuthReady) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
      <div className="flex flex-col items-center gap-4">
        <Bomb className="w-12 h-12 text-red-500 animate-bounce" />
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">Inizializzando il Caos...</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] p-6 text-center text-white">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md space-y-8"
      >
        <div className="space-y-4">
          <div className="text-6xl animate-float">🏢💥</div>
          <h1 className="text-5xl font-display font-black uppercase tracking-tighter text-green-500">Chaos Corp</h1>
          <p className="text-zinc-400 font-medium">L&apos;unico simulatore aziendale dove il fallimento è l&apos;unica opzione accettabile.</p>
        </div>

        <button 
          onClick={handleLogin}
          className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          <Users className="w-5 h-5" /> ENTRA NELLA LEZIONE
        </button>
        
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">Richiesto Google Login per il multiplayer live</p>
      </motion.div>
    </div>
  );

  const isAdmin = user?.email === 'mariveravox@gmail.com';

  const playFailSound = () => {
    const audio = new Audio('https://www.soundjay.com/misc/fail-trombone-01.mp3');
    audio.play().catch(e => console.error("Audio playback failed:", e));
  };

  return (
    <main className="min-h-screen pt-20 pb-20 bg-[#0a0a0a] text-white">
      <ProgressBar currentHour={session.currentHour} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={session.currentHour}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {session.currentHour === 1 && <Hour1 />}
          {session.currentHour === 2 && <Hour2 />}
          {session.currentHour === 3 && <Hour3 />}
          {session.currentHour === 4 && <Hour4 />}
          {session.currentHour === 5 && <Hour5 user={user} />}
        </motion.div>
      </AnimatePresence>

      {isAdmin && <AdminPanel currentHour={session.currentHour} setHour={setHour} />}

      <footer className="fixed bottom-0 left-0 w-full p-4 bg-black/80 backdrop-blur border-t border-white/5 flex flex-col md:flex-row justify-between items-center px-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 overflow-hidden rounded-full border border-white/10 bg-white/5">
            <Image 
              src="https://lh3.googleusercontent.com/d/1PxU_d3N_FDouXPCRTy9HPOGPE0l4kOdI" 
              alt="Logo Progetto" 
              fill 
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-tight">Progetto didattico a cura di</span>
            <a href="https://indennitatedigital.it" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-green-500 hover:underline">Indennitatedigital.it</a>
          </div>
          <button 
            onClick={playFailSound}
            className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
            title="Riproduci Fail"
          >
            <Volume2 className="w-3 h-3 text-zinc-500 group-hover:text-green-500" />
          </button>
        </div>
        
        <div className="flex flex-col items-center md:items-end text-center md:text-right">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Chaos_Node_Live_01</span>
          </div>
          <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest leading-tight">
            per Garanzia Giovani, Forum Lab, Lecce, 16 marzo 2026
          </div>
        </div>
      </footer>
    </main>
  );
}
