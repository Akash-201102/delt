import { extractWithAi } from "./aiService";

export interface ParsedItem {
  description: string;
  price: string;
}

export interface ParsedEntry {
  name: string;
  date: string;
  // original single amount for backward compatibility (may be empty if items/total used)
  amount?: string;
  items: ParsedItem[];
  total: string;
}

export function parseOcrText(rawText: string): ParsedEntry {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  let name = '';
  let amount = ''; // legacy
  let date = '';
  const items: ParsedItem[] = [];
  let total = '';

  for (const line of lines) {
    const lower = line.toLowerCase();

    // Name detection
    if (!name && /name\s*[:\-=]\s*/i.test(line)) {
      name = line.replace(/name\s*[:\-=]\s*/i, '').trim();
      continue;
    }

    // Date detection
    if (!date) {
      const dateMatch = line.match(
        /(?:date\s*[:\-=]?\s*)?(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i
      );
      if (dateMatch) {
        date = dateMatch[1];
        // continue;
      }
    }

    // If line looks like an address (city, state, zip), skip as item
    if (/[A-Z]{2}\s\d{5}/.test(line) || /^\d+\s+[A-Za-z\s]+(St|Ave|Rd|Ln|Way|Blvd)/i.test(line)) {
      continue;
    }

    // Skip common invoice headers that aren't items
    if (/^(invoice|bill to|ship to|p\.o\.?|due date|date|qty|description|unit price|amount)$/i.test(lower)) {
      continue;
    }

    // Try to parse items/total by looking for a price at end of line
    const priceMatch = line.match(/(.*?)(\$|₹|rs\.?\s*)?(\d[\d,]*\.?\d{2})$/i) ||
      line.match(/(.*?)(\$|₹|rs\.?\s*)?(\d+)$/i);

    if (priceMatch) {
      let desc = priceMatch[1].trim();
      let price = priceMatch[3].replace(/,/g, '');

      // strip common currency symbols and noise from description
      desc = desc.replace(/[₹$€£:]/g, '').replace(/^[-*•\s]+/, '').trim();

      // if description looks like a date or invoice number skip
      if (/\d[\/\-.]\d/.test(desc) || /^[A-Z]{2}-\d+$/i.test(desc)) {
        continue;
      }

      // treat lines containing total/amount keywords (but NOT unit price) as total value
      const isTotalKeyword = /\b(total|balance|amount)\b/i.test(desc) || /\b(total|amount)\b/i.test(lower);
      const isHeaderKeyword = /\b(subtotal|tax|discount|qty|price)\b/i.test(desc) || /\b(header|invoice|date)\b/i.test(desc);

      if (isTotalKeyword && !isHeaderKeyword) {
        total = price;
      } else if (!isHeaderKeyword && desc.length > 2) {
        // treat as item if description is non-empty and not a header
        items.push({ description: desc, price });
      } else if (!amount && !total && !isHeaderKeyword) {
        amount = price;
      }
      continue;
    }

    // FALLBACKS
    if (!amount) {
      const amtMatch = line.match(/(?:amt|amount|rs|₹|inr|total)\s*[:\-=]?\s*(\d[\d,]*\.?\d*)/i);
      if (amtMatch) {
        amount = amtMatch[1].replace(/,/g, '');
      }
    }
  }

  // Fallback: try to find any name-like text (first non-number non-date line)
  if (!name) {
    for (const line of lines) {
      const trimmed = line.trim();
      if (!/\d/.test(trimmed) && trimmed.length > 3 && !/date|amt|amount|total|invoice/i.test(trimmed)) {
        name = trimmed;
        break;
      }
    }
  }

  // Final validation for total
  if (!total && amount) {
    total = amount;
  }

  return { name, date, amount: amount || undefined, items, total };
}
