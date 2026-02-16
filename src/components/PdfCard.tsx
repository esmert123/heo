import { Eye, Download } from 'lucide-react';
import { Button } from './ui/Button';
import { PdfThumbnail } from './PdfThumbnail';
import type { SponsorshipDocument } from '../data/sponsorshipDocs';

interface PdfCardProps {
  document: SponsorshipDocument;
  onPreview: (pdfUrl: string, title: string) => void;
}

async function downloadPdf(url: string, fileName: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, '_blank');
  }
}

export function PdfCard({ document: doc, onPreview }: PdfCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-corporate-600/30 rounded-xl overflow-hidden shadow-2xl hover:shadow-corporate-500/20 hover:border-corporate-500/50 transition-all duration-300 max-w-sm w-full group">
      <div className="relative overflow-hidden cursor-pointer" onClick={() => onPreview(doc.pdfUrl, doc.title)}>
        <PdfThumbnail pdfUrl={doc.pdfUrl} />
        <div className="absolute inset-0 bg-corporate-900/0 group-hover:bg-corporate-900/40 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-4">
            <Eye className="w-8 h-8 text-white" />
          </div>
        </div>
        <span className="absolute top-3 right-3 bg-corporate-800/80 backdrop-blur-sm text-corporate-200 text-xs font-bold px-2.5 py-1 rounded-md">
          {doc.lang}
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-1.5">{doc.title}</h3>
        <p className="text-corporate-300 text-sm mb-5 leading-relaxed">
          {doc.description}
        </p>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => onPreview(doc.pdfUrl, doc.title)}
            className="flex-1 justify-center"
          >
            Onizle
          </Button>
          <Button
            variant="primary"
            icon={<Download className="w-4 h-4" />}
            onClick={() => downloadPdf(doc.pdfUrl, doc.fileName)}
            className="flex-1 justify-center"
          >
            Indir
          </Button>
        </div>
      </div>
    </div>
  );
}
