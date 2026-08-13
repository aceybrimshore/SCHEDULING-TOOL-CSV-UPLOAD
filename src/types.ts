export type AppTheme = 'dark' | 'semi-dark' | 'light';

export interface LocationRule {
  id: string;
  locationName: string; // e.g. "Sydney"
  subsidiaryId: number; // e.g. 7
  locationId: number;   // e.g. 25
}

export interface InputCsvRow {
  [key: string]: string | number | undefined;
}

export interface OutputSchedulerRow {
  id: string; // unique internal row key for grid operations
  subsidiary_id: number | string;
  item_id: string;
  location: number | string;
  start_date: string; // e.g. "28/08/2026"
  end_date: string;   // e.g. "28/08/2026"
  quantity: number | string;
  memo: string;
  
  // Optional reference fields captured from source CSV
  sourceLocation?: string;
  productCode?: string; // SKU
  moq?: number | string; // Minimum Order Quantity
  labor_required?: number | string;
  labor_ttl_hours?: number | string;
  isEndDateCustom?: boolean; // Track if end date was manually overridden
}

export interface ColumnMappingConfig {
  itemIdColumn: string;       // Default: "Sum of Internal ID"
  quantityColumn: string;     // Default: "Sum of UnitsToProduce"
  locationColumn: string;     // Default: "location"
  productColumn?: string;     // Default: "product"
  moqColumn?: string;         // Default: "Sum of min_order_qty"
  laborColumn?: string;       // Default: "Sum of Ttl Hrs"
}

export interface DefaultRowConfig {
  startDate: string; // e.g., "28/08/2026"
  endDate: string;   // e.g., "28/08/2026"
  memo: string;      // e.g., "W31 - CSO"
  dateFormat: 'DD/MM/YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY';
  defaultSubsidiaryId: number;
  defaultLocationId: number;
}

export interface ValidationWarning {
  rowId: string;
  field: keyof OutputSchedulerRow;
  message: string;
  type: 'error' | 'warning';
}
