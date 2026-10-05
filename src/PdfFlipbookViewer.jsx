import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import * as pdfjs from "pdfjs-dist";
import portfolioPdfUrl from "./Portfolio_yingyot_ice.pdf?url";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url,
).toString();

const FlipPage = forwardRef(function FlipPage({ imageUrl, pageNumber, isCover }, ref) {
  return (
    <div
      className="flipbook-page"
      ref={ref}
      {...(isCover ? { "data-density": "hard" } : {})}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`Portfolio page ${pageNumber}`}
          draggable={false}
        />
      ) : (
        <div className="flipbook-page-placeholder">
          <span>Loading page {pageNumber}…</span>
        </div>
      )}
    </div>
  );
});

async function renderPdfPage(pdf, pageNumber, targetWidth) {
  const page = await pdf.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = targetWidth / baseViewport.width;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL("image/jpeg", 0.88);
}

export default function PdfFlipbookViewer() {
  const containerRef = useRef(null);
  const flipBookRef = useRef(null);
  const pdfRef = useRef(null);
  const pageImagesRef = useRef([]);
  const renderingRef = useRef(new Set());
  const [size, setSize] = useState({ width: 520, height: 680 });
  const [pageImages, setPageImages] = useState([]);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loadError, setLoadError] = useState(null);
  const [docReady, setDocReady] = useState(false);

  const renderWidth = Math.min(Math.round(size.width * (window.devicePixelRatio || 1)), 2200);

  useEffect(() => {
    pageImagesRef.current = pageImages;
  }, [pageImages]);

  const ensurePageRendered = useCallback(
    async (pageNumber) => {
      const pdf = pdfRef.current;
      if (!pdf || pageNumber < 1 || pageNumber > pdf.numPages) return;
      if (pageImagesRef.current[pageNumber - 1]) return;
      if (renderingRef.current.has(pageNumber)) return;

      renderingRef.current.add(pageNumber);
      try {
        const dataUrl = await renderPdfPage(pdf, pageNumber, renderWidth);
        if (!pdfRef.current) return;
        setPageImages((prev) => {
          if (prev.length === 0) return prev;
          const next = [...prev];
          next[pageNumber - 1] = dataUrl;
          return next;
        });
      } finally {
        renderingRef.current.delete(pageNumber);
      }
    },
    [renderWidth],
  );

  const prefetchAround = useCallback(
    (index) => {
      const page = index + 1;
      void ensurePageRendered(page);
      void ensurePageRendered(page + 1);
      void ensurePageRendered(page + 2);
      void ensurePageRendered(page - 1);
    },
    [ensurePageRendered],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 40 || h < 40) return;
      const controlsReserve = 56;
      const availH = Math.max(h - controlsReserve, 200);
      const aspect = 3 / 4;
      let width = w;
      let height = width / aspect;
      if (height > availH) {
        height = availH;
        width = height * aspect;
      }
      if (width > w) {
        width = w;
        height = width / aspect;
      }
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const pdf = await pdfjs.getDocument(portfolioPdfUrl).promise;
        if (cancelled) return;
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
        setPageImages(Array.from({ length: pdf.numPages }, () => null));
        setDocReady(true);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Failed to load PDF");
        }
      }
    })();

    return () => {
      cancelled = true;
      pdfRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!docReady || numPages === 0) return;
    prefetchAround(0);
  }, [docReady, numPages, prefetchAround, renderWidth]);

  const onFlip = useCallback(
    (e) => {
      const index = e.data;
      setCurrentPage(index);
      prefetchAround(index);
    },
    [prefetchAround],
  );

  const flipPrev = () => flipBookRef.current?.pageFlip()?.flipPrev();
  const flipNext = () => flipBookRef.current?.pageFlip()?.flipNext();

  if (loadError) {
    return (
      <div className="flipbook-root flipbook-root--error">
        <p>Could not open portfolio PDF.</p>
        <p className="flipbook-error-detail">{loadError}</p>
      </div>
    );
  }

  if (!docReady || numPages === 0) {
    return (
      <div className="flipbook-root flipbook-root--loading">
        <p>Loading portfolio…</p>
      </div>
    );
  }

  return (
    <div className="flipbook-root" ref={containerRef}>
      <HTMLFlipBook
        ref={flipBookRef}
        width={size.width}
        height={size.height}
        size="stretch"
        minWidth={300}
        maxWidth={1400}
        minHeight={400}
        maxHeight={1600}
        showCover
        mobileScrollSupport
        className="flipbook"
        onFlip={onFlip}
      >
        {pageImages.map((src, i) => (
          <FlipPage
            key={i}
            pageNumber={i + 1}
            imageUrl={src}
            isCover={i === 0 || i === numPages - 1}
          />
        ))}
      </HTMLFlipBook>

      <div className="flipbook-controls">
        <button type="button" onClick={flipPrev} aria-label="Previous page">
          ‹
        </button>
        <span>
          {Math.min(currentPage + 1, numPages)} / {numPages}
        </span>
        <button type="button" onClick={flipNext} aria-label="Next page">
          ›
        </button>
      </div>
      <p className="flipbook-hint">Drag a page corner or use the arrows to flip</p>
    </div>
  );
}
