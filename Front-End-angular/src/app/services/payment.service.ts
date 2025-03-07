import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:8000/search_payments/'; // URL
//   router: Router = inject(Router)

 private resultsData: any[] = [];

 setResultsData(data: any) {
  console.log('Data being set in service:', data);
  this.resultsData = data;
}

 getResultsData(): any[] {
  return this.resultsData;
 }

  constructor(private http: HttpClient) {}

  searchPayments(vat: string, sapNumber: string, year: number, entalma: string = ''): Observable<any> {
    const payload = { vat, sapNumber, year, entalma };
    console.log('Payload sent to backend:', payload); // Log the payload
    return this.http.post<any>(this.apiUrl, payload).pipe(
        map((response) => {
            console.log('Response received:', response); // Log the response
            return response;
        }),
        catchError((error: HttpErrorResponse) => {
            console.error('Backend error:', error);
            return throwError(() => new Error('Error connecting to the server.'));
        })
    );
  }
}
