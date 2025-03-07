import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PaymentService } from 'src/app/services/payment.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // ✅ Import CommonModule

@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule], // ✅ Add CommonModule
  templateUrl: './search-form.component.html',
  styleUrl: './search-form.component.css'
})
export class SearchFormComponent implements OnInit {
  form: FormGroup;
  noResults: boolean = false;
  noResultsMessage: string = '';
  router = inject(Router);
  years: number[] = []; // Dynamic year list

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService
  ) {
    this.form = this.fb.group({
      vat: ['', [Validators.required, this.vatValidator]],
      sapNumber: ['', [Validators.required, this.sapNumberValidator]],
      year: [new Date().getFullYear(), Validators.required], // Default year is current year
      entalma: ['']
    });
  }

  ngOnInit() {
    this.initializeYears();
  }

  initializeYears() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 6 }, (_, i) => currentYear - i); // Last 5 years + current year
  }

  // VAT Validator: Ensures 9-digit integer
  vatValidator(control: AbstractControl): ValidationErrors | null {
    const vatRegex = /^\d{9}$/;
    return vatRegex.test(control.value) ? null : { invalidVat: true };
  }

  // Sap Code Validator: Ensures 10-digit integer starting with 5
  sapNumberValidator(control: AbstractControl): ValidationErrors | null {
    const sapRegex = /^5\d{9}$/;
    return sapRegex.test(control.value) ? null : { invalidSapNumber: true };
  }

  onSubmit() {
    if (this.form.valid) {
      this.paymentService.searchPayments(
        this.form.value.vat,
        this.form.value.sapNumber,
        this.form.value.year,
        this.form.value.entalma || '' // Optional field
      ).subscribe({
        next: (response) => {
          if (response.status === 'success' && response.data.length > 0) {
            this.paymentService.setResultsData(response.data);
            this.router.navigate(['/payment-analysis']);
          } else if (response.status === 'partial_match') {
            this.noResultsMessage = 'Δεν βρέθηκαν πληρωμές για το συγκεκριμένο ένταλμα.';
            this.noResults = true;
          } else {
            this.noResultsMessage = 'Δεν βρέθηκαν πληρωμές για τα δεδομένα που δώσατε.';
            this.noResults = true;
          }
        },
        error: (err) => {
          console.error('Error connecting to the server:', err);
          this.noResultsMessage = 'Σφάλμα σύνδεσης στον διακομιστή.';
          this.noResults = true;
        }
      });
    }
  }
}
