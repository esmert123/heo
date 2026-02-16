import { useState, useCallback } from 'react';

interface PdfViewerState {
  isOpen: boolean;
  currentPdfUrl: string | null;
  currentTitle: string;
  numPages: number;
  currentPage: number;
  scale: number;
}

export function usePdfViewer() {
  const [state, setState] = useState<PdfViewerState>({
    isOpen: false,
    currentPdfUrl: null,
    currentTitle: '',
    numPages: 0,
    currentPage: 1,
    scale: 1.0,
  });

  const openViewer = useCallback((pdfUrl: string, title: string) => {
    setState({
      isOpen: true,
      currentPdfUrl: pdfUrl,
      currentTitle: title,
      numPages: 0,
      currentPage: 1,
      scale: 1.0,
    });
  }, []);

  const closeViewer = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false, currentPdfUrl: null }));
  }, []);

  const setNumPages = useCallback((n: number) => {
    setState((prev) => ({ ...prev, numPages: n }));
  }, []);

  const nextPage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentPage: Math.min(prev.currentPage + 1, prev.numPages),
    }));
  }, []);

  const prevPage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentPage: Math.max(prev.currentPage - 1, 1),
    }));
  }, []);

  const zoomIn = useCallback(() => {
    setState((prev) => ({ ...prev, scale: Math.min(prev.scale + 0.25, 3.0) }));
  }, []);

  const zoomOut = useCallback(() => {
    setState((prev) => ({ ...prev, scale: Math.max(prev.scale - 0.25, 0.5) }));
  }, []);

  return {
    ...state,
    openViewer,
    closeViewer,
    setNumPages,
    nextPage,
    prevPage,
    zoomIn,
    zoomOut,
  };
}
