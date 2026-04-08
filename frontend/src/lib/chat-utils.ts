// path: frontend/src/lib/chat-utils.ts
import { Citation } from "@/types/chat";

export const decodeBase64UTF8 = (base64: string): string => {
  try {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch (error) {
    console.error("Failed to decode base64 string", error);
    return "";
  }
};

/**
 * Robustly converts various citation formats into Markdown links.
 * Handles: [[citation:1]], [citation:2.2.3], [[Citation:5]], etc.
 */
export const markdownParse = (text: string): string => {
  if (!text) return "";

  return text
    // 1. Handle double brackets: [[citation:1.2]] -> [citation:1.2]
    .replace(/\[\[[cC]itation:([\d.]+)\]\]/g, "[citation:$1]")
    
    // 2. Convert to standard Markdown link: [citation:2.2.3] -> [2.2.3](2.2.3)
    // The [\d.]+ allows for hierarchical IDs used by local models like Gemma
    .replace(/\[[cC]itation:([\d.]+)\]/g, "[$1]($1)")
    
    // 3. Fallback for formats without colons: [citation 4] -> [4](4)
    .replace(/\[[cC]itation\s+([\d.]+)\]/g, "[$1]($1)");
};

export const parseLLMResponse = (content: string): { text: string; citations: Citation[] } => {
  try {
    // If the delimiter isn't present, the model might still be streaming 
    // the initial context or a direct response.
    if (!content.includes("__LLM_RESPONSE__")) {
      return { text: markdownParse(content), citations: [] };
    }

    // Split at the first occurrence of the delimiter
    const parts = content.split("__LLM_RESPONSE__");
    const base64Part = parts[0];
    // Re-join remaining parts in case the delimiter appears in the text body
    const responseText = parts.slice(1).join("__LLM_RESPONSE__");

    let parsed = null;
    if (base64Part?.trim()) {
      try {
        const decodedString = decodeBase64UTF8(base64Part.trim());
        parsed = JSON.parse(decodedString);
      } catch (e) {
        console.warn("Failed to parse context chunk", e);
      }
    }

    // Map context to Citation objects
    const citations: Citation[] =
      parsed?.context?.map((c: any, i: number) => ({
        // Use the metadata's own ID if available, otherwise fallback to index
        id: c.metadata?.id || i + 1, 
        text: c.page_content,
        metadata: c.metadata,
      })) || [];

    return {
      text: markdownParse(responseText || ""),
      citations,
    };
  } catch (e) {
    console.error("Parse error:", e);
    return { text: markdownParse(content), citations: [] };
  }
};