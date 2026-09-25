/**
 * Sanjivani Ai Tool — PromptGuard AI
 * PDF Content & Text Extraction Pipeline
 *
 * Implements: PDF Input -> Stream Parsing -> Text Extraction -> Context Separation
 */

import { normalizeInputText } from "./textParser";

export interface PdfExtractionResult {
  extractedText: string;
  pageCount: number;
  hasHiddenInstructions: boolean;
  rawByteLength: number;
  metadata: Record<string, string>;
}

export function extractTextFromPdf(pdfContentOrBase64: string): PdfExtractionResult {
  if (!pdfContentOrBase64) {
    return {
      extractedText: "",
      pageCount: 0,
      hasHiddenInstructions: false,
      rawByteLength: 0,
      metadata: {},
    };
  }

  let text = pdfContentOrBase64;
  let byteLength = pdfContentOrBase64.length;

  // Handle Base64 encoded PDFs
  if (pdfContentOrBase64.startsWith("data:application/pdf;base64,") || /^[A-Za-z0-9+/=]{100,}$/.test(pdfContentOrBase64.trim())) {
    try {
      const cleanBase64 = pdfContentOrBase64.replace(/^data:application\/pdf;base64,/, "").trim();
      const decodedBuffer = Buffer.from(cleanBase64, "base64");
      byteLength = decodedBuffer.length;
      text = decodedBuffer.toString("utf-8");
    } catch {
      // Keep original text
    }
  }

  // PDF Text stream extractor (regex based parser for standard PDF stream blocks)
  const extractedLines: string[] = [];

  // 1. Match Tj / TJ operator text chunks: (Some Text) Tj or [(Some) 20 (Text)] TJ
  const tjPattern = /\(([^)]+)\)\s*(?:Tj|'|")/g;
  let match: RegExpExecArray | null;
  while ((match = tjPattern.exec(text)) !== null) {
    if (match[1]) {
      extractedLines.push(match[1]);
    }
  }

  // 2. Match array TJ operators: [(Hello) 10 (World)] TJ
  const arrayTjPattern = /\[([^\]]+)\]\s*TJ/g;
  while ((match = arrayTjPattern.exec(text)) !== null) {
    const inner = match[1];
    const subMatch = inner.match(/\(([^)]+)\)/g);
    if (subMatch) {
      extractedLines.push(subMatch.map((s) => s.slice(1, -1)).join(" "));
    }
  }

  let finalText = "";
  if (extractedLines.length > 0) {
    finalText = extractedLines.join("\n");
  } else {
    // If text was already plain text or Markdown disguised as PDF content
    finalText = text
      .replace(/%PDF-[0-9.]+/g, "")
      .replace(/[0-9]+ [0-9]+ obj[\s\S]*?endobj/g, "")
      .replace(/xref[\s\S]*?trailer[\s\S]*?%%EOF/g, "")
      .trim();
    if (!finalText) {
      finalText = text;
    }
  }

  const normalized = normalizeInputText(finalText);
  const hasHidden = /ignore\s+(all\s+)?previous|system\s+prompt|confidential/i.test(normalized);

  return {
    extractedText: normalized,
    pageCount: Math.max(1, (text.match(/\/Type\s*\/Page\b/g) || []).length),
    hasHiddenInstructions: hasHidden,
    rawByteLength: byteLength,
    metadata: {
      parser: "SanjivaniPdfStreamExtractor/v2",
      contextType: "UNTRUSTED_PDF_DOCUMENT",
    },
  };
}
