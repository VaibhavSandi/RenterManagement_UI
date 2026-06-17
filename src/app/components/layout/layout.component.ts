import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  sidebarOpen = true;
  userDropdownOpen = false;

  navItems = [
    { label: 'Dashboard', icon: 'bi-speedometer2', route: '/dashboard' },
    { label: 'Flat Master', icon: 'bi-building', route: '/flats' },
    { label: 'Renter Master', icon: 'bi-people', route: '/renters' },
    { label: 'Add Rent Payment', icon: 'bi-cash-coin', route: '/payments' },
    { label: 'Transaction History', icon: 'bi-clock-history', route: '/transactions' },
    { label: 'Pending Rent', icon: 'bi-exclamation-triangle', route: '/pending' },
    { label: 'Final Settlement', icon: 'bi-check-circle', route: '/settlement' },
    { label: 'Reports', icon: 'bi-file-earmark-bar-graph', route: '/reports' },
  ];

  constructor(private dataService: MockDataService, private router: Router) {}

  get userName(): string {
    return this.dataService.getCurrentUser()?.name || 'User';
  }

  get userInitial(): string {
    return this.userName.charAt(0).toUpperCase();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleUserDropdown(): void {
    this.userDropdownOpen = !this.userDropdownOpen;
  }

  closeUserDropdown(): void {
    this.userDropdownOpen = false;
  }

  logout(): void {
    this.dataService.logout();
    this.router.navigate(['/login']);
  }

  onBackdropClick(): void {
    this.sidebarOpen = false;
  }
}
