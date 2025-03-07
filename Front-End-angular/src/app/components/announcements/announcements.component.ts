import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [MatCardModule,
    MatListModule,
    MatExpansionModule, MatIconModule],
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.css'
})
export class AnnouncementsComponent {
  announcements = [
    {
      title: 'Ηλεκτρονική Τιμολόγιση',
      date: '18-11-2024',
      content: 'Η έκδοση ηλεκτρονικών τιμολογίων είναι υποχρεωτική για τιμολόγια που αφορούν συμβάσεις ή ιδιωτικά συμφωνητικά των οποίων η καθαρή αξία ξεπερνά τα 2.500,00 € και έχουν υπογραφεί από τις 1-1-2024 και έπειτα, σύυμφωνα με την ΚΥΑ 52445 ΕΞ 2023 (ΦΕΚ 2385/Β/12-04-2023)'
    },
    {
      title: 'Βεβαίωση Παρακράτησης Φόρου Εισοδήματος 2024',
      date: '14-11-2024',
      content: 'Η βεβαίωση παρακράτησης φόρου εισοδήματος θα δοθεί μέσα στο πρώτο τρίμηνο του 2025 και θα αφορά τον φόρο εισοδήματος που έχει παρακρατηθεί συνολικά από την Πολεμική Αεροπορία κατά τις πληρωμές που έχουν πραγματοποιηθεί μέσα στο έτος 2024.'
    },
    {
      title: 'Νομιμοποίηση τιμολογίων δαπανών στρατιωτικών νοσκομείων',
      date: '14-11-2024',
      content: 'Σας ενημερώνουμε ότι η εξόφληση των τιμολογίων που αφορούν αναλώσιμο υγειονομικό και φαρμακευτικό υλικό και δεν εμπίπτουν σε κάποια σύμβαση, δύναται να εξοφληθούν εφόσον η ημερομηνία έκδοσης τους είναι προγενέστερη από  , βάση του ΦΕΚ'
    }
  ];
}
