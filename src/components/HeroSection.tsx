import { FileText } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[400px] flex items-center justify-center overflow-hidden bg-corporate-900">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-corporate-900 via-corporate-800 to-corporate-700" />

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-corporate-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-gold/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 py-16 max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-gold/15 rounded-2xl mb-6">
          <FileText className="w-8 h-8 text-accent-gold" />
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-5">
          Sponsorluk
        </h1>
        <p className="text-lg md:text-xl text-corporate-300 leading-relaxed max-w-2xl mx-auto">
          Etkinligimize sponsor olarak destek verebilirsiniz. Asagidaki
          belgeleri inceleyerek sponsorluk paketlerimiz hakkinda detayli bilgi
          alabilirsiniz.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="w-12 h-0.5 bg-accent-gold/40" />
          <div className="w-2 h-2 bg-accent-gold rounded-full" />
          <div className="w-12 h-0.5 bg-accent-gold/40" />
        </div>
      </div>
    </section>
  );
}
