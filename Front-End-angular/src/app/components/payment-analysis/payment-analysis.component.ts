import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PaymentService } from 'src/app/services/payment.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-payment-analysis',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-analysis.component.html',
  styleUrl: './payment-analysis.component.css'
})
export class PaymentAnalysisComponent implements OnInit {
  results: any[] = [];
  noData: boolean = false;
  

  factoringMap: { [key: string]: string } = {
    '5006000001': 'Εθνική Factors',
    '5006000002': 'Eurobank Factors',
    '5006000003': 'Τράπεζα Πειραιώς',
    '5006000004': 'ABC Factors',
    '5006000005': 'Εθνική Τράπεζα',
    '5006000006': 'Πειραιώς Factoring',
    '5006000007': 'Alpha Bank',
    '5006000008': 'Eurobank Ergasias',
    '5006000009': 'BFF Bank',
    '5006000221': 'Optima Bank',
    '5006000226': 'Takeda Ελλάς',
    '5006000227': 'Booka Chemicals Hellas',
    '5006000228': 'Attica Bank'
  };

  constructor(
    private router: Router,
    private paymentService: PaymentService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.results = this.paymentService.getResultsData();
    this.noData = this.results.length === 0;
  }

  parseGreekNumber(value: any): number {
    if (typeof value === 'string') {
      const normalizedValue = value.replace(/\./g, '').replace(/,/g, '.');
      return parseFloat(normalizedValue) || 0;
    }
    return value;
  }

  groupByEntalma() {
    const groups: any[] = [];
    let currentGroup: any = { items: [], subtotals: {} };

    this.results.forEach((row, index) => {
      if (index === 0 || row['Αρ. Εντάλματος'] !== this.results[index - 1]['Αρ. Εντάλματος']) {
        if (currentGroup.items.length > 0) {
          currentGroup.subtotals = this.calculateSubtotals(currentGroup.items);
          groups.push(currentGroup);
        }
        currentGroup = { items: [], subtotals: {}, entalma: row['Αρ. Εντάλματος'] };
      }
      currentGroup.items.push(row);
    });

    if (currentGroup.items.length > 0) {
      currentGroup.subtotals = this.calculateSubtotals(currentGroup.items);
      groups.push(currentGroup);
    }

    return groups;
  }

  calculateSubtotals(items: any[]) {
    return {
      'Συνολική Αξία': items.reduce((sum, item) => sum + this.parseGreekNumber(item['Συνολική Αξία']), 0),
      'ΦΟΡΟΣ (4%)': items.reduce((sum, item) => sum + this.parseGreekNumber(item['ΦΟΡΟΣ (4%)']), 0),
      'ΦΟΡΟΣ (8%)': items.reduce((sum, item) => sum + this.parseGreekNumber(item['ΦΟΡΟΣ (8%)']), 0),
      'ΦΟΡΟΣ (3%)': items.reduce((sum, item) => sum + this.parseGreekNumber(item['ΦΟΡΟΣ (3%)']), 0),
      'ΦΟΡΟΣ (20%': items.reduce((sum, item) => sum + this.parseGreekNumber(item['ΦΟΡΟΣ (20%']), 0),
      'Σύνολο Κρατήσεων': items.reduce((sum, item) => sum + this.parseGreekNumber(item['Σύνολο Κρατήσεων']), 0),
      'Πληρωτέα Αξία': items.reduce((sum, item) => sum + this.parseGreekNumber(item['Πληρωτέα Αξία']), 0),
    };
  }

  calculateGrandTotal(column: string): number {
    return this.results.reduce((sum, record) => sum + this.parseGreekNumber(record[column]), 0);
  }


  getFactoringLabel(code: string): string {
    if (this.factoringMap[code]) {
      return this.factoringMap[code];
    }
    if (/^5\d{9}$/.test(code)) {
      return 'Δ.Ο.Υ. / Τράπεζα';
    } else {
      return code;
    }
  }

  // Method to download the Excel file
  downloadExcel(): void {
    // Convert results data to a worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.results);
    
    // Create a new workbook and add the worksheet
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PaymentAnalysis');

    // Save the Excel file
    XLSX.writeFile(workbook, 'PaymentAnalysis.xlsx');
  }

}
