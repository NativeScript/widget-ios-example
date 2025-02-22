import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { DetailComponent } from './detail.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'detail/:id', component: DetailComponent },
];
