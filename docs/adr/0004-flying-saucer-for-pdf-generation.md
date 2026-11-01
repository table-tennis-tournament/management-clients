# Flying Saucer (OpenPDF) for PDF generation and print

The settings/print module rendered PDFs with `openhtmltopdf` (a fork of Flying Saucer). We replaced it with Flying Saucer `org.xhtmlrenderer:flying-saucer-pdf:10.7.0` so that PDF creation and printing run on an up-to-date library. The `PdfGenerator` port and its callers are unchanged.

## Considered Options

- **Keep `openhtmltopdf-pdfbox` 1.0.10 (status quo)** — rejected: we want an up-to-date library for PDF creation and print.
- **`flying-saucer-pdf-openpdf` 9.4.0** — rejected: frozen since 2023 and its jar is not published to Maven Central (only a pom).
- **`flying-saucer-pdf` 10.7.0 (chosen)** — LGPL 2.1+; despite the artifact name the 10.x line renders via OpenPDF (`com.github.librepdf:openpdf`), not iText.

## Consequences

- The PDF engine changes from PDFBox to OpenPDF.
- `OpenHtmlPdfGenerator` is renamed to `FlyingSaucerPdfGenerator` and uses `ITextRenderer` (`setDocumentFromString` / `layout` / `createPDF`).
- `useFastMode()` has no Flying Saucer equivalent and is dropped; the standard layout path is used.
- `spec/07_backend_modular_monolith.md` is updated to reference Flying Saucer.
