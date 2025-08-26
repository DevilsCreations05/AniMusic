export class PrinterFormatter {
  private static readonly DOT_MATRIX_WIDTH = 80; // Standard dot matrix width
  private static readonly SEPARATOR_CHAR = '-';
  private static readonly SPACE_CHAR = ' ';

  static centerText(text: string, width: number = this.DOT_MATRIX_WIDTH): string {
    if (text.length >= width) return text.substring(0, width);
    
    const padding = Math.floor((width - text.length) / 2);
    return this.SPACE_CHAR.repeat(padding) + text + this.SPACE_CHAR.repeat(width - text.length - padding);
  }

  static leftAlignText(text: string, width: number = this.DOT_MATRIX_WIDTH): string {
    if (text.length >= width) return text.substring(0, width);
    return text + this.SPACE_CHAR.repeat(width - text.length);
  }

  static rightAlignText(text: string, width: number = this.DOT_MATRIX_WIDTH): string {
    if (text.length >= width) return text.substring(0, width);
    return this.SPACE_CHAR.repeat(width - text.length) + text;
  }

  static createSeparatorLine(char: string = this.SEPARATOR_CHAR, width: number = this.DOT_MATRIX_WIDTH): string {
    return char.repeat(width);
  }

  static formatTwoColumns(left: string, right: string, width: number = this.DOT_MATRIX_WIDTH): string {
    const maxLeftWidth = width - right.length - 1;
    const truncatedLeft = left.length > maxLeftWidth ? left.substring(0, maxLeftWidth) : left;
    const padding = width - truncatedLeft.length - right.length;
    return truncatedLeft + this.SPACE_CHAR.repeat(padding) + right;
  }

  static formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  static formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  static wrapText(text: string, width: number = this.DOT_MATRIX_WIDTH): string[] {
    if (text.length <= width) return [text];
    
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + word).length <= width) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  static addEmptyLine(): string {
    return '';
  }

  static formatTableRow(columns: string[], columnWidths: number[]): string {
    if (columns.length !== columnWidths.length) {
      throw new Error('Columns and widths arrays must have the same length');
    }

    let row = '';
    for (let i = 0; i < columns.length; i++) {
      const column = columns[i].length > columnWidths[i] 
        ? columns[i].substring(0, columnWidths[i]) 
        : columns[i];
      
      row += column.padEnd(columnWidths[i], ' ');
      if (i < columns.length - 1) row += ' ';
    }

    return row.substring(0, this.DOT_MATRIX_WIDTH);
  }
}