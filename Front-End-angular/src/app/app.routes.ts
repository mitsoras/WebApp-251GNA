import { Routes } from '@angular/router';
import { AboutPageComponent } from './components/about-page/about-page.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { AnnouncementsComponent } from './components/announcements/announcements.component';
import { SearchFormComponent } from './components/search-form/search-form.component';
import { PaymentAnalysisComponent } from './components/payment-analysis/payment-analysis.component';
import { ContactComponent } from './components/contact/contact.component';


export const routes: Routes = [
    {path: 'home', component: HomePageComponent},
    {path : "", redirectTo: '/home', pathMatch: 'full'},
    {path: 'about', component: AboutPageComponent},
    {path: 'announcements', component: AnnouncementsComponent},
    {path: 'search-form', component: SearchFormComponent},
    {path: 'payment-analysis', component: PaymentAnalysisComponent},
    {path: 'contact', component: ContactComponent},
    {path: '**', redirectTo: '/home'},
];
