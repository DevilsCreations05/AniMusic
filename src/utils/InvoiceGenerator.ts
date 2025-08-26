import { InvoiceData, InvoiceItem } from '../types/printer';
import { IUser } from '../database/models/User';
import { PrinterFormatter } from './PrinterFormatter';

export class InvoiceGenerator {
  private static readonly COMPANY_NAME = 'AniMusic Entertainment';
  private static readonly COMPANY_ADDRESS = '123 Music Street, Anime City, AC 12345';
  private static readonly COMPANY_PHONE = '+1 (555) 123-MUSIC';
  private static readonly TAX_RATE = 0.08; // 8% tax

  static generateDummyInvoice(user: IUser | null): InvoiceData {
    const currentDate = new Date();
    const invoiceNumber = `INV-${currentDate.getFullYear()}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // Generate dummy items based on a music app context
    const dummyItems: InvoiceItem[] = [
      {
        description: 'Premium Subscription (1 Month)',
        quantity: 1,
        unitPrice: 9.99,
        total: 9.99,
      },
      {
        description: 'High Quality Music Download',
        quantity: 5,
        unitPrice: 1.29,
        total: 6.45,
      },
      {
        description: 'Exclusive Anime OST Collection',
        quantity: 1,
        unitPrice: 24.99,
        total: 24.99,
      },
      {
        description: 'Custom Playlist Creation Service',
        quantity: 2,
        unitPrice: 4.99,
        total: 9.98,
      },
    ];

    const subtotal = dummyItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * this.TAX_RATE;
    const total = subtotal + tax;

    return {
      invoiceNumber,
      date: currentDate.toISOString().split('T')[0],
      customerName: user?.name || 'Guest User',
      customerEmail: user?.email || 'guest@example.com',
      items: dummyItems,
      subtotal,
      tax,
      total,
      companyName: this.COMPANY_NAME,
      companyAddress: this.COMPANY_ADDRESS,
      companyPhone: this.COMPANY_PHONE
    };
  }

  static formatInvoiceForDotMatrix(invoice: InvoiceData): string {
    const lines: string[] = [];
    
    // Header
    lines.push(PrinterFormatter.addEmptyLine());
    lines.push(PrinterFormatter.centerText(invoice.companyName));
    lines.push(PrinterFormatter.centerText(invoice.companyAddress));
    lines.push(PrinterFormatter.centerText(invoice.companyPhone));
    lines.push(PrinterFormatter.addEmptyLine());
    lines.push(PrinterFormatter.createSeparatorLine('='));
    lines.push(PrinterFormatter.centerText('INVOICE'));
    lines.push(PrinterFormatter.createSeparatorLine('='));
    lines.push(PrinterFormatter.addEmptyLine());

    // Invoice details
    lines.push(PrinterFormatter.formatTwoColumns('Invoice Number:', invoice.invoiceNumber));
    lines.push(PrinterFormatter.formatTwoColumns('Date:', PrinterFormatter.formatDate(new Date(invoice.date))));
    lines.push(PrinterFormatter.addEmptyLine());

    // Customer details
    lines.push('BILL TO:');
    lines.push(invoice.customerName);
    lines.push(invoice.customerEmail);
    lines.push(PrinterFormatter.addEmptyLine());
    lines.push(PrinterFormatter.createSeparatorLine());

    // Items header
    const itemHeaderWidths = [35, 8, 12, 12];
    lines.push(PrinterFormatter.formatTableRow(
      ['DESCRIPTION', 'QTY', 'UNIT PRICE', 'TOTAL'],
      itemHeaderWidths
    ));
    lines.push(PrinterFormatter.createSeparatorLine());

    // Items
    invoice.items.forEach(item => {
      // Handle long descriptions by wrapping
      const descriptionLines = PrinterFormatter.wrapText(item.description, itemHeaderWidths[0]);
      
      // First line with all details
      lines.push(PrinterFormatter.formatTableRow([
        descriptionLines[0],
        item.quantity.toString(),
        PrinterFormatter.formatCurrency(item.unitPrice),
        PrinterFormatter.formatCurrency(item.total)
      ], itemHeaderWidths));

      // Additional description lines if needed
      for (let i = 1; i < descriptionLines.length; i++) {
        lines.push(PrinterFormatter.formatTableRow([
          descriptionLines[i],
          '',
          '',
          ''
        ], itemHeaderWidths));
      }
    });

    lines.push(PrinterFormatter.createSeparatorLine());

    // Totals
    lines.push(PrinterFormatter.formatTwoColumns('SUBTOTAL:', PrinterFormatter.formatCurrency(invoice.subtotal)));
    lines.push(PrinterFormatter.formatTwoColumns('TAX (8%):', PrinterFormatter.formatCurrency(invoice.tax)));
    lines.push(PrinterFormatter.createSeparatorLine());
    lines.push(PrinterFormatter.formatTwoColumns('TOTAL:', PrinterFormatter.formatCurrency(invoice.total)));
    lines.push(PrinterFormatter.createSeparatorLine('='));

    // Footer
    lines.push(PrinterFormatter.addEmptyLine());
    lines.push(PrinterFormatter.centerText('Thank you for using AniMusic!'));
    lines.push(PrinterFormatter.centerText('Visit us at www.animusic.com'));
    lines.push(PrinterFormatter.addEmptyLine());
    lines.push(PrinterFormatter.centerText('** Please keep this invoice for your records **'));
    lines.push(PrinterFormatter.addEmptyLine());
    lines.push(PrinterFormatter.addEmptyLine());

    return lines.join('\n');
  }
}