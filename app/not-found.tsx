import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white p-4">
      <h2 className="text-4xl font-bold mb-4">404 - Pagina Non Trovata</h2>
      <p className="text-zinc-400 mb-8">Sembra che tu ti sia perso nei corridoi della Chaos Corp.</p>
      <Link 
        href="/"
        className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-colors"
      >
        Torna alla Reception
      </Link>
    </div>
  );
}
