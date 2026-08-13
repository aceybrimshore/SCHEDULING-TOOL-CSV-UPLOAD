export function ddmmyyyyToIso(dateStr: string): string {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const trimmed = dateStr.trim();
  
  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  
  // If DD/MM/YYYY or DD-MM-YYYY
  const parts = trimmed.split(/[/.-]/);
  if (parts.length === 3) {
    let day = parts[0];
    let month = parts[1];
    let year = parts[2];
    
    // If format is YYYY/MM/DD
    if (day.length === 4) {
      year = parts[0];
      month = parts[1];
      day = parts[2];
    }

    if (year.length === 2) {
      year = `20${year}`;
    }

    const pad = (num: string, len = 2) => num.padStart(len, '0');
    return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
  }
  
  return '';
}

export function isoToDdmmyyyy(isoStr: string): string {
  if (!isoStr || typeof isoStr !== 'string') return '';
  const trimmed = isoStr.trim();
  
  // If YYYY-MM-DD
  const parts = trimmed.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const year = parts[0];
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
    return `${day}/${month}/${year}`;
  }
  
  return isoStr;
}

export function getCurrentWeekMemo(): string {
  const now = new Date();
  let d = new Date('2025-12-29T12:00:00Z');
  for (let i = 1; i <= 52; i++) {
    const end = new Date(d);
    end.setDate(end.getDate() + 7);
    
    if (now >= d && now < end) {
      const weekNum = i.toString().padStart(2, '0');
      return `W${weekNum}`;
    }
    d.setDate(d.getDate() + 7);
  }
  return 'W01';
}

export function getMemoOptions() {
  const options: { label: string; value: string; sublabel?: string }[] = [];
  let d = new Date('2025-12-29T12:00:00Z');
  for (let i = 1; i <= 52; i++) {
    const start = new Date(d);
    const end = new Date(d);
    end.setDate(end.getDate() + 6);
    
    const formatDate = (date: Date, includeYear: boolean) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dStr = date.getUTCDate().toString().padStart(2, '0');
      const mStr = months[date.getUTCMonth()];
      if (includeYear) {
        return `${dStr} ${mStr} ${date.getUTCFullYear()}`;
      }
      return `${dStr} ${mStr}`;
    };

    const startStr = formatDate(start, i === 1);
    const endStr = formatDate(end, i === 1 && start.getUTCFullYear() !== end.getUTCFullYear());
    
    const weekNum = i.toString().padStart(2, '0');
    
    options.push({ 
      label: `W${weekNum}`, 
      value: `W${weekNum}`, 
      sublabel: `${startStr} - ${endStr}` 
    });
    
    d.setDate(d.getDate() + 7);
  }
  return [
    ...options,
    { label: 'CSO Production', value: 'CSO Production' },
    { label: 'Stock Replenishment', value: 'Stock Replenishment' },
    { label: 'Urgent Priority', value: 'Urgent Priority' },
  ];
}
