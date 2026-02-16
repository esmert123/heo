import { sponsorshipDocuments } from '../data/sponsorshipDocs';
import { PdfCard } from './PdfCard';

interface SponsorshipCardsProps {
  onPreview: (pdfUrl: string, title: string) => void;
}

export function SponsorshipCards({ onPreview }: SponsorshipCardsProps) {
  return (
    <section className="py-16 px-4 bg-corporate-900">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-3">
          Sponsorluk Belgeleri
        </h2>
        <p className="text-corporate-300 text-center mb-12 max-w-xl mx-auto leading-relaxed">
          Asagidaki belgeleri onizleyebilir veya dogrudan indirebilirsiniz.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
          {sponsorshipDocuments.map((doc) => (
            <PdfCard key={doc.id} document={doc} onPreview={onPreview} />
          ))}
        </div>
      </div>
    </section>
  );
}
