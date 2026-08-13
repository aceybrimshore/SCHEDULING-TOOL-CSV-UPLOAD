import Papa from 'papaparse';
import {
  ColumnMappingConfig,
  DefaultRowConfig,
  InputCsvRow,
  LocationRule,
  OutputSchedulerRow,
  ValidationWarning,
} from '../types';

export function parseCsvText(csvContent: string): {
  data: InputCsvRow[];
  headers: string[];
  errors: string[];
} {
  const parseResult = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim(),
  });

  const headers = parseResult.meta.fields || [];
  const errors = parseResult.errors.map((e) => e.message);

  return {
    data: parseResult.data,
    headers,
    errors,
  };
}

export function autoDetectColumns(headers: string[]): ColumnMappingConfig {
  let itemIdColumn = '';
  let quantityColumn = '';
  let locationColumn = '';
  let productColumn = '';
  let moqColumn = '';
  let laborColumn = '';

  for (const h of headers) {
    const lower = h.toLowerCase().trim();

    if (!itemIdColumn) {
      if (
        lower.includes('internal id') ||
        lower.includes('internal_id') ||
        lower.includes('item_id') ||
        (lower.includes('sum of') && lower.includes('id'))
      ) {
        itemIdColumn = h;
      }
    }

    if (!quantityColumn) {
      if (
        lower.includes('unitstoproduce') ||
        lower.includes('units to produce') ||
        lower.includes('units_to_produce') ||
        lower.includes('quantity') ||
        lower.includes('qty') ||
        (lower.includes('sum of') && lower.includes('units'))
      ) {
        quantityColumn = h;
      }
    }

    if (!locationColumn) {
      if (lower === 'location' || lower.includes('location') || lower.includes('site')) {
        locationColumn = h;
      }
    }

    if (!productColumn) {
      if (lower === 'product' || lower.includes('product') || lower.includes('sku')) {
        productColumn = h;
      }
    }

    if (!moqColumn) {
      if (
        lower.includes('min_order_qty') ||
        lower.includes('min order qty') ||
        lower.includes('min order quantity') ||
        lower.includes('moq') ||
        (lower.includes('sum of') && lower.includes('min_order'))
      ) {
        moqColumn = h;
      }
    }

    if (!laborColumn) {
      if (lower.includes('sum of labor ttl hrs')) {
        laborColumn = h;
      }
    }
    if (!laborColumn) {
      if (
        lower.includes('ttl hrs') ||
        lower.includes('total hrs')
      ) {
        laborColumn = h;
      }
    }
  }

  // Fallbacks if not auto-detected
  if (!itemIdColumn && headers.length > 0) {
    itemIdColumn = headers.find((h) => h.toLowerCase().includes('id')) || headers[0];
  }
  if (!quantityColumn && headers.length > 1) {
    quantityColumn =
      headers.find((h) => h.toLowerCase().includes('unit') || h.toLowerCase().includes('qty')) ||
      headers[Math.min(3, headers.length - 1)];
  }
  if (!locationColumn && headers.length > 0) {
    locationColumn = headers.find((h) => h.toLowerCase().includes('loc')) || headers[0];
  }
  if (!moqColumn && headers.length > 0) {
    moqColumn = headers.find((h) => h.toLowerCase().includes('moq') || h.toLowerCase().includes('min_order')) || '';
  }
  if (!laborColumn && headers.length > 0) {
    laborColumn = headers.find((h) => h.toLowerCase().includes('labor')) || '';
  }

  return {
    itemIdColumn: itemIdColumn || 'Sum of Internal ID',
    quantityColumn: quantityColumn || 'Sum of UnitsToProduce',
    locationColumn: locationColumn || 'location',
    productColumn: productColumn || 'product',
    moqColumn: moqColumn || 'Sum of min_order_qty',
    laborColumn: laborColumn || 'Sum of Ttl Hrs',
  };
}

export function transformInputToOutput(
  inputRows: InputCsvRow[],
  mappingConfig: ColumnMappingConfig,
  locationRules: LocationRule[],
  defaults: DefaultRowConfig
): OutputSchedulerRow[] {
  return inputRows.map((row, index) => {
    // Read raw fields
    const rawItemId = String(row[mappingConfig.itemIdColumn] ?? '').trim();
    const rawQuantity = String(row[mappingConfig.quantityColumn] ?? '').trim();
    const rawLocation = String(row[mappingConfig.locationColumn] ?? '').trim();
    const rawProduct = mappingConfig.productColumn ? String(row[mappingConfig.productColumn] ?? '').trim() : '';
    const rawMoq = mappingConfig.moqColumn ? String(row[mappingConfig.moqColumn] ?? '').trim() : '';
    const rawLabor = mappingConfig.laborColumn ? String(row[mappingConfig.laborColumn] ?? '').trim() : '';

    // Match location rule
    const matchedRule = locationRules.find(
      (r) => r.locationName.toLowerCase().trim() === rawLocation.toLowerCase().trim()
    );

    const subsidiaryId = matchedRule ? matchedRule.subsidiaryId : defaults.defaultSubsidiaryId;
    const locationId = matchedRule ? matchedRule.locationId : defaults.defaultLocationId;

    // Parse quantity as integer or float, keep exact numeric if valid
    const parsedQty = parseFloat(rawQuantity.replace(/,/g, ''));
    const quantityVal = isNaN(parsedQty) ? rawQuantity : parsedQty;

    // Parse MOQ
    const parsedMoq = parseFloat(rawMoq.replace(/,/g, ''));
    const moqVal = isNaN(parsedMoq) ? (rawMoq !== '' ? rawMoq : '') : parsedMoq;

    // Parse Labor Required
    const parsedLabor = parseFloat(rawLabor.replace(/,/g, ''));
    const laborVal = isNaN(parsedLabor) ? (rawLabor !== '' ? rawLabor : '') : parsedLabor;

    return {
      id: `row-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
      subsidiary_id: subsidiaryId,
      item_id: rawItemId,
      location: locationId,
      start_date: defaults.startDate,
      end_date: defaults.endDate,
      quantity: quantityVal,
      memo: defaults.memo,
      sourceLocation: rawLocation,
      productCode: rawProduct,
      moq: moqVal,
      labor_ttl_hours: laborVal,
    };
  });
}

export function generateCsvOutput(rows: OutputSchedulerRow[]): string {
  // Exact required headers: subsidiary_id,item_id,location,start_date,end_date,quantity,memo
  const exportData = rows.map((r) => ({
    subsidiary_id: r.subsidiary_id,
    item_id: r.item_id,
    location: r.location,
    start_date: r.start_date,
    end_date: r.end_date,
    quantity: r.quantity,
    memo: r.memo,
  }));

  return Papa.unparse(exportData, {
    quotes: false,
    header: true,
  });
}

export function validateOutputRows(rows: OutputSchedulerRow[], locationRules: LocationRule[]): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  rows.forEach((r) => {
    if (!r.item_id) {
      warnings.push({
        rowId: r.id,
        field: 'item_id',
        message: 'Item ID is missing',
        type: 'error',
      });
    }

    const qty = Number(r.quantity);
    if (isNaN(qty) || qty <= 0) {
      warnings.push({
        rowId: r.id,
        field: 'quantity',
        message: 'Quantity should be a positive number',
        type: 'warning',
      });
    }

    if (!r.subsidiary_id) {
      warnings.push({
        rowId: r.id,
        field: 'subsidiary_id',
        message: 'Subsidiary ID is missing',
        type: 'error',
      });
    }

    if (!r.location) {
      warnings.push({
        rowId: r.id,
        field: 'location',
        message: 'Location ID is missing',
        type: 'warning',
      });
    }
  });

  return warnings;
}

export function getDefaultFormattedDate(daysOffset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
