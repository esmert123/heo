import { useEffect, useCallback } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
} from 'lucide-react';
import { Modal } from './ui/Modal';

interface PdfViewerModalProps {
  isOpen: boolean;
  pdfUrl: string | null;
  title: string;
  numPages: number;
  currentPage: number;
  scale: number;
  onClose: () => void;
  onDocumentLoadSuccess: (numPages: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

async function handleDownload(url: string, title: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, '_blank');
  }
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-corporate-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function PdfViewerModal({
  isOpen,
  pdfUrl,
  title,
  numPages,
  currentPage,
  scale,
  onClose,
  onDocumentLoadSuccess,
  onNextPage,
  onPrevPage,
  onZoomIn,
  onZoomOut,
}: PdfViewerModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onPrevPage();
      if (e.key === 'ArrowRight') onNextPage();
    },
    [onPrevPage, onNextPage],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!pdfUrl) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col w-full h-full md:h-auto bg-corporate-900 md:rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-corporate-700 bg-corporate-800 md:rounded-t-xl shrink-0">
          <h2 className="text-white font-semibold text-sm md:text-base truncate pr-4">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-corporate-300 hover:text-white transition-colors p-1.5 hover:bg-corporate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto bg-gray-800 flex items-start justify-center p-4 min-h-0 md:max-h-[calc(90vh-120px)]">
          <Document
            file={pdfUrl}
            loading={<LoadingSpinner />}
            onLoadSuccess={({ numPages: n }) => onDocumentLoadSuccess(n)}
            error={
              <div className="text-corporate-300 text-center py-20">
                <p className="text-lg font-medium mb-2">PDF yuklenemedi</p>
                <p className="text-sm">
                  Lutfen internet baglantinizi kontrol edin.
                </p>
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              renderAnnotationLayer={false}
              renderTextLayer={true}
              loading={<LoadingSpinner />}
            />
          </Document>
        </div>

        {/* Navigation Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-corporate-700 bg-corporate-800 md:rounded-b-xl shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={onPrevPage}
              disabled={currentPage <= 1}
              className="p-2 text-corporate-300 hover:text-white hover:bg-corporate-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-corporate-200 text-sm px-2 min-w-[100px] text-center">
              Sayfa {currentPage} / {numPages || '...'}
            </span>
            <button
              onClick={onNextPage}
              disabled={currentPage >= numPages}
              className="p-2 text-corporate-300 hover:text-white hover:bg-corporate-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onZoomOut}
              disabled={scale <= 0.5}
              className="p-2 text-corporate-300 hover:text-white hover:bg-corporate-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-corporate-200 text-xs px-1.5 min-w-[45px] text-center">
              %{Math.round(scale * 100)}
            </span>
            <button
              onClick={onZoomIn}
              disabled={scale >= 3.0}
              className="p-2 text-corporate-300 hover:text-white hover:bg-corporate-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => handleDownload(pdfUrl, title)}
            className="flex items-center gap-2 px-4 py-2 bg-accent-gold hover:bg-accent-gold-light text-corporate-900 font-semibold text-sm rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Indir</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
