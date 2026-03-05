import * as XLSX from 'xlsx';

export interface EntryItem {
  description: string;
  price: string;
}

export interface EntryRow {
  name: string;
  date: string;
  total?: string;
  amount?: string; // legacy
  items?: EntryItem[];
  created_at: string;
}

export function exportToExcel(data: EntryRow[], filename = 'entries.xlsx') {
  // first sheet: summary entries
  const summarySheet = XLSX.utils.json_to_sheet(
    data.map((d) => ({
      Name: d.name,
      Date: d.date,
      Total: d.total || d.amount || '',
      'Created At': new Date(d.created_at).toLocaleString(),
    }))
  );
  summarySheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 25 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Entries');

  // second sheet: individual items
  const itemRows: any[] = [];
  data.forEach((d) => {
    if (d.items && d.items.length) {
      d.items.forEach((it) => {
        itemRows.push({
          'Entry Name': d.name,
          Description: it.description,
          Price: it.price,
          Date: d.date,
        });
      });
    }
  });

  if (itemRows.length) {
    const itemsSheet = XLSX.utils.json_to_sheet(itemRows);
    itemsSheet['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, itemsSheet, 'Items');
  }

  XLSX.writeFile(wb, filename);
}

export function exportCasinoToExcel(data: any[], filename = 'casino_entries.xlsx') {
  const sheet = XLSX.utils.json_to_sheet(
    data.map((d) => ({
      'Player Name': d.player_name || d.playerName || '',
      'Time In': d.time_in || d.timeIn || '',
      'Table No.': d.table_no || d.tableNo || '',
      'Rupees': d.rupees || '',
      'Time Out': d.time_out || d.timeOut || '',
      'Created At': d.created_at ? new Date(d.created_at).toLocaleString() : '',
    }))
  );

  sheet['!cols'] = [
    { wch: 25 }, // Name
    { wch: 15 }, // Time In
    { wch: 12 }, // Table
    { wch: 12 }, // Rupees
    { wch: 15 }, // Time Out
    { wch: 25 }, // Created
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, 'Casino Entries');
  XLSX.writeFile(wb, filename);
}
