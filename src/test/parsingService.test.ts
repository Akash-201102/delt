import { describe, it, expect } from 'vitest';
import { parseOcrText, ParsedEntry } from '@/services/parsingService';

// these are fairly simplisticunit tests; real OCR results can vary widely

describe('parseOcrText', () => {
  it('extracts name, date, total from simple receipt', () => {
    const text = `Store Name\nDate: 12/05/2025\nItem A 10.00\nItem B 5.50\nTotal 15.50`;
    const parsed = parseOcrText(text);

    expect(parsed.name).toBe('Store Name');
    expect(parsed.date).toBe('12/05/2025');
    expect(parsed.total).toBe('15.50');
    expect(parsed.items).toEqual([
      { description: 'Item A', price: '10.00' },
      { description: 'Item B', price: '5.50' },
    ]);
  });

  it('handles lines with currency symbols and commas', () => {
    const text = `NAME: ACME Corp\n01-01-2026\nWidget 1 1,200.00\nWidget 2 ₹300\nTotal: ₹1,500.00`;
    const p = parseOcrText(text);
    expect(p.name).toBe('ACME Corp');
    expect(p.total).toBe('1500.00');
    expect(p.items).toEqual([
      { description: 'Widget 1', price: '1200.00' },
      { description: 'Widget 2', price: '300' },
    ]);
  });

  it('handles complex invoice with addresses and headers', () => {
    const text = `East Repair Inc.\n1912 Harvest Lane\nNew York, NY 12210\nInvoice # US-001\nDate: 11/02/2019\nFront and rear brake cables 100.00\nNew set of pedal arms 30.00\nLabor 3hrs 15.00\nSubtotal 145.00\nSales Tax 9.06\nTOTAL 154.06`;
    const p = parseOcrText(text);

    expect(p.name).toContain('East Repair Inc');
    expect(p.total).toBe('154.06');
    // Ensure core items are present
    const descriptions = p.items.map(i => i.description.toLowerCase());
    expect(descriptions).toContain('front and rear brake cables');
    expect(descriptions).toContain('new set of pedal arms');
    expect(descriptions.some(d => d.includes('labor'))).toBe(true);

    // Ensure tax/subtotal headers are NOT items
    expect(descriptions).not.toContain('subtotal');
    expect(descriptions).not.toContain('sales tax');
  });
});
