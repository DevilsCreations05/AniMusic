export interface PrinterDevice {
  id: string;
  name: string;
  model: string;
  isConnected: boolean;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PrintOptions {
  copies: number;
  paperWidth: number; // in characters for dot matrix
  lineHeight: number;
}

export enum PrinterStatus {
  READY = 'ready',
  PRINTING = 'printing',
  ERROR = 'error',
  OFFLINE = 'offline',
  OUT_OF_PAPER = 'out_of_paper'
}

export interface PrintResult {
  success: boolean;
  message: string;
  jobId?: string;
}