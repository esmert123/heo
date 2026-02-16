import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';

interface PdfThumbnailProps {
  pdfUrl: string;
}

function ThumbnailSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-corporate-100 animate-pulse">
      <svg
        className="w-12 h-12 text-corporate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
    </div>
  );
}

function ThumbnailError() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-corporate-100 text-corporate-500">
      <svg
        className="w-12 h-12 mb-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
      <span className="text-xs font-medium">PDF</span>
    </div>
  );
}

export function PdfThumbnail({ pdfUrl }: PdfThumbnailProps) {
  return (
    <div className="w-full aspect-[3/4] overflow-hidden bg-corporate-100 flex items-center justify-center">
      <Document
        file={pdfUrl}
        loading={<ThumbnailSkeleton />}
        error={<ThumbnailError />}
      >
        <Page
          pageNumber={1}
          width={300}
          renderAnnotationLayer={false}
          renderTextLayer={false}
        />
      </Document>
    </div>
  );
}
