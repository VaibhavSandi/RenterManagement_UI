import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'flats',
        loadComponent: () => import('./components/flat-master/flat-master.component').then(m => m.FlatMasterComponent)
      },
      {
        path: 'renters',
        loadComponent: () => import('./components/renter-master/renter-master.component').then(m => m.RenterMasterComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./components/rent-payment/rent-payment.component').then(m => m.RentPaymentComponent)
      },
      {
        path: 'parking',
        loadComponent: () => import('./components/parking-details/parking-details.component').then(m => m.ParkingDetailsComponent)
      },
      {
        path: 'pending',
        loadComponent: () => import('./components/pending-rent/pending-rent.component').then(m => m.PendingRentComponent)
      },
      {
        path: 'settlement',
        loadComponent: () => import('./components/final-settlement/final-settlement.component').then(m => m.FinalSettlementComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: 'expenses',
        loadComponent: () => import('./components/expense-master/expense-master.component').then(m => m.ExpenseMasterComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
