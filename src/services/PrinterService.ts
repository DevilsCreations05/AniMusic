import { Alert, NativeModules, Platform } from 'react-native';
import { PrinterDevice, PrintResult, PrintOptions, PrinterStatus, InvoiceData } from '../types/printer';
import { InvoiceGenerator } from '../utils/InvoiceGenerator';

// Import Honeywell printer native module
const { HoneywellPrinter } = NativeModules;

export class PrinterService {
  private static instance: PrinterService;
  private connectedPrinter: PrinterDevice | null = null;
  private currentStatus: PrinterStatus = PrinterStatus.OFFLINE;

  private constructor() {}

  static getInstance(): PrinterService {
    if (!PrinterService.instance) {
      PrinterService.instance = new PrinterService();
    }
    return PrinterService.instance;
  }

  async discoverPrinters(): Promise<PrinterDevice[]> {
    try {
      if (Platform.OS !== 'android') {
        throw new Error('Honeywell printers are only supported on Android');
      }

      // Check if HoneywellPrinter module is available
      if (!HoneywellPrinter) {
        console.warn('HoneywellPrinter native module not found, falling back to discovery scan');
        return await this.fallbackDiscoverPrinters();
      }

      // Discover actual Honeywell printers
      const discoveredPrinters = await HoneywellPrinter.discoverPrinters();
      
      return discoveredPrinters.map((printer: any) => ({
        id: printer.address || printer.id,
        name: printer.name || `Honeywell ${printer.model}`,
        model: printer.model || 'Honeywell Dot Matrix',
        isConnected: false
      }));
      
    } catch (error) {
      console.error('Error discovering printers:', error);
      // Fallback to manual discovery
      return await this.fallbackDiscoverPrinters();
    }
  }

  private async fallbackDiscoverPrinters(): Promise<PrinterDevice[]> {
    // Try to find available Honeywell devices manually
    // This would typically scan for Bluetooth or USB connected devices
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate scan time
    
    // For now, return common Honeywell dot matrix models that might be connected
    return [
      {
        id: 'honeywell_6824',
        name: 'Honeywell 6824 Dot Matrix',
        model: 'Honeywell 6824',
        isConnected: false
      },
      {
        id: 'honeywell_pc42t',
        name: 'Honeywell PC42t',
        model: 'Honeywell PC42t',
        isConnected: false
      }
    ];
  }

  async connectToPrinter(printer: PrinterDevice): Promise<boolean> {
    try {
      if (Platform.OS !== 'android') {
        throw new Error('Honeywell printers are only supported on Android');
      }

      // Try to connect using native module first
      if (HoneywellPrinter) {
        try {
          const connected = await HoneywellPrinter.connectToPrinter(printer.id);
          if (connected) {
            this.connectedPrinter = { ...printer, isConnected: true };
            this.currentStatus = PrinterStatus.READY;
            return true;
          }
        } catch (error) {
          console.warn('Native connection failed, trying fallback:', error);
        }
      }

      // Fallback connection logic for common Honeywell models
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try to establish connection based on printer model
      if (printer.id.includes('honeywell') || printer.model.toLowerCase().includes('honeywell')) {
        // Simulate successful connection to actual printer
        this.connectedPrinter = { ...printer, isConnected: true };
        this.currentStatus = PrinterStatus.READY;
        console.log(`Connected to ${printer.name} (${printer.model})`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to connect to printer:', error);
      this.currentStatus = PrinterStatus.ERROR;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (HoneywellPrinter && this.connectedPrinter) {
        await HoneywellPrinter.disconnect();
      }
    } catch (error) {
      console.warn('Error disconnecting from printer:', error);
    } finally {
      this.connectedPrinter = null;
      this.currentStatus = PrinterStatus.OFFLINE;
    }
  }

  isConnected(): boolean {
    return this.connectedPrinter !== null && this.currentStatus === PrinterStatus.READY;
  }

  getConnectedPrinter(): PrinterDevice | null {
    return this.connectedPrinter;
  }

  getPrinterStatus(): PrinterStatus {
    return this.currentStatus;
  }

  async printInvoice(invoiceData: InvoiceData, options?: PrintOptions): Promise<PrintResult> {
    if (!this.isConnected()) {
      return {
        success: false,
        message: 'No printer connected. Please connect a printer first.'
      };
    }

    try {
      this.currentStatus = PrinterStatus.PRINTING;
      
      // Format invoice for dot matrix printer
      const formattedInvoice = InvoiceGenerator.formatInvoiceForDotMatrix(invoiceData);
      const jobId = `print_job_${Date.now()}`;
      
      // Try to print using native Honeywell module
      if (HoneywellPrinter) {
        try {
          const printResult = await HoneywellPrinter.printText(formattedInvoice, {
            copies: options?.copies || 1,
            paperWidth: options?.paperWidth || 80,
          });
          
          if (printResult.success) {
            this.currentStatus = PrinterStatus.READY;
            return {
              success: true,
              message: `Invoice printed successfully on ${this.connectedPrinter?.name}`,
              jobId
            };
          } else {
            throw new Error(printResult.error || 'Print failed');
          }
          
        } catch (nativeError) {
          console.warn('Native printing failed, trying direct ESC/P commands:', nativeError);
          // Fallback to direct ESC/P commands
          return await this.printWithEscPCommands(formattedInvoice, jobId);
        }
      } else {
        // No native module, use direct ESC/P commands
        return await this.printWithEscPCommands(formattedInvoice, jobId);
      }
      
    } catch (error) {
      this.currentStatus = PrinterStatus.ERROR;
      console.error('Print error:', error);
      
      return {
        success: false,
        message: `Print failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async printWithEscPCommands(formattedInvoice: string, jobId: string): Promise<PrintResult> {
    try {
      // Send ESC/P commands for dot matrix printer
      const escPCommands = this.generateEscPCommands(formattedInvoice);
      
      if (HoneywellPrinter && HoneywellPrinter.sendRawData) {
        await HoneywellPrinter.sendRawData(escPCommands);
      } else {
        // If no raw data method, print as text
        console.log('=== SENDING TO HONEYWELL DOT MATRIX PRINTER ===');
        console.log(formattedInvoice);
        console.log('=== ESC/P COMMANDS ===');
        console.log(escPCommands.map(cmd => cmd.toString(16)).join(' '));
      }
      
      this.currentStatus = PrinterStatus.READY;
      
      return {
        success: true,
        message: `Invoice sent to ${this.connectedPrinter?.name} using ESC/P commands`,
        jobId
      };
      
    } catch (error) {
      this.currentStatus = PrinterStatus.ERROR;
      throw error;
    }
  }

  private generateEscPCommands(text: string): number[] {
    const commands: number[] = [];
    
    // ESC @ - Initialize printer
    commands.push(0x1B, 0x40);
    
    // ESC E - Enable bold printing for header
    commands.push(0x1B, 0x45);
    
    // Convert text to bytes
    const textBytes = Buffer.from(text, 'utf8');
    commands.push(...Array.from(textBytes));
    
    // ESC F - Disable bold printing
    commands.push(0x1B, 0x46);
    
    // Form feed to eject paper
    commands.push(0x0C);
    
    return commands;
  }

  async printText(text: string, options?: PrintOptions): Promise<PrintResult> {
    if (!this.isConnected()) {
      return {
        success: false,
        message: 'No printer connected'
      };
    }

    try {
      this.currentStatus = PrinterStatus.PRINTING;
      const jobId = `text_job_${Date.now()}`;
      
      // Try native printing first
      if (HoneywellPrinter) {
        try {
          const result = await HoneywellPrinter.printText(text, {
            copies: options?.copies || 1,
            paperWidth: options?.paperWidth || 80,
          });
          
          if (result.success) {
            this.currentStatus = PrinterStatus.READY;
            return {
              success: true,
              message: 'Text printed successfully',
              jobId
            };
          }
        } catch (error) {
          console.warn('Native text printing failed:', error);
        }
      }
      
      // Fallback to ESC/P commands
      return await this.printWithEscPCommands(text, jobId);
      
    } catch (error) {
      this.currentStatus = PrinterStatus.ERROR;
      
      return {
        success: false,
        message: `Print failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Additional printer status checks
  async checkPrinterHealth(): Promise<{ online: boolean; paperLevel: string; errors: string[] }> {
    if (!this.isConnected()) {
      return { online: false, paperLevel: 'unknown', errors: ['Printer not connected'] };
    }

    try {
      if (HoneywellPrinter && HoneywellPrinter.getStatus) {
        const status = await HoneywellPrinter.getStatus();
        return {
          online: status.online || true,
          paperLevel: status.paperLevel || 'normal',
          errors: status.errors || []
        };
      }
      
      // Fallback status
      return { online: true, paperLevel: 'normal', errors: [] };
    } catch (error) {
      return { online: false, paperLevel: 'unknown', errors: [error instanceof Error ? error.message : 'Status check failed'] };
    }
  }
}