import './config/pdfSetup';

import { HeroSection } from './components/HeroSection';
import { SponsorshipCards } from './components/SponsorshipCards';
import { PdfViewerModal } from './components/PdfViewerModal';
import { Footer } from './components/Footer';
import { usePdfViewer } from './hooks/usePdfViewer';

export default function App() {
  const viewer = usePdfViewer();

  return (
    <div className="min-h-screen bg-corporate-900 text-white font-sans">
      <HeroSection />
      <SponsorshipCards onPreview={viewer.openViewer} />
      <PdfViewerModal
        isOpen={viewer.isOpen}
        pdfUrl={viewer.currentPdfUrl}
        title={viewer.currentTitle}
        numPages={viewer.numPages}
        currentPage={viewer.currentPage}
        scale={viewer.scale}
        onClose={viewer.closeViewer}
        onDocumentLoadSuccess={viewer.setNumPages}
        onNextPage={viewer.nextPage}
        onPrevPage={viewer.prevPage}
        onZoomIn={viewer.zoomIn}
        onZoomOut={viewer.zoomOut}
      />
      <Footer />
    </div>
  );
}
