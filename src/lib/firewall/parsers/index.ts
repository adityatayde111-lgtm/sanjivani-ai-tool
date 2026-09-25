/**
 * Sanjivani Ai Tool — PromptGuard AI
 * Unified Parser Pipeline Entry Point
 */

import { InputSourceType } from "../types";
import { normalizeInputText } from "./textParser";
import { extractTextFromPdf } from "./pdfParser";
import { parseHtmlContent, fetchAndExtractUrl } from "./webParser";
import { extractTextFromImagePayload } from "./ocrParser";

export interface UnifiedParseResult {
  extractedText: string;
  source: InputSourceType;
  metadata: Record<string, unknown>;
  durationMs: number;
}

export async function parseIncomingContent(
  content: string,
  source: InputSourceType,
  extra?: { url?: string; fileData?: string }
): Promise<UnifiedParseResult> {
  const start = performance.now();

  let extractedText = "";
  const metadata: Record<string, unknown> = {
    source,
    timestamp: new Date().toISOString(),
  };

  switch (source) {
    case "pdf": {
      const pdfInput = extra?.fileData || content;
      const res = extractTextFromPdf(pdfInput);
      extractedText = res.extractedText;
      metadata.pageCount = res.pageCount;
      metadata.rawBytes = res.rawByteLength;
      metadata.hasHiddenInstructions = res.hasHiddenInstructions;
      break;
    }

    case "web_url": {
      if (extra?.url || content.startsWith("http://") || content.startsWith("https://")) {
        const targetUrl = extra?.url || content.trim();
        const res = await fetchAndExtractUrl(targetUrl);
        extractedText = res.extractedText;
        metadata.url = res.url;
        metadata.title = res.title;
        metadata.isMock = res.isMock;
      } else {
        const res = parseHtmlContent(content);
        extractedText = res.extractedText;
        metadata.title = res.title;
      }
      break;
    }

    case "image_ocr": {
      const imageInput = extra?.fileData || content;
      const res = extractTextFromImagePayload(imageInput);
      extractedText = res.extractedText;
      metadata.ocrConfidence = res.confidence;
      metadata.wordCount = res.wordCount;
      break;
    }

    case "json_api": {
      try {
        const parsedObj = JSON.parse(content);
        extractedText = normalizeInputText(JSON.stringify(parsedObj, null, 2));
        metadata.isJson = true;
      } catch {
        extractedText = normalizeInputText(content);
        metadata.isJson = false;
      }
      break;
    }

    case "email":
    case "markdown":
    case "code":
    case "user_text":
    default: {
      extractedText = normalizeInputText(content);
      break;
    }
  }

  const durationMs = Math.round((performance.now() - start) * 100) / 100;

  return {
    extractedText,
    source,
    metadata,
    durationMs,
  };
}
