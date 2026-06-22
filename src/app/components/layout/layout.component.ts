import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent implements OnInit, OnDestroy {
  sidebarOpen = true;
  userDropdownOpen = false;
  currentLang = 'en';
  navItems: NavItem[] = [];
  private langSub!: Subscription;

  constructor(
    private dataService: MockDataService,
    private router: Router,
    public lang: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.buildNavItems();
    this.langSub = this.lang.lang$.subscribe(l => {
      this.currentLang = l;
      this.buildNavItems();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  private buildNavItems(): void {
    this.navItems = [
      { label: this.lang.t('nav_dashboard'),   icon: 'bi-speedometer2',          route: '/dashboard'    },
      { label: this.lang.t('nav_flat_master'),  icon: 'bi-building',              route: '/flats'        },
      { label: this.lang.t('nav_renter_master'),icon: 'bi-people',                route: '/renters'      },
      { label: this.lang.t('nav_add_payment'),  icon: 'bi-cash-coin',             route: '/payments'     },
      { label: this.lang.t('nav_transactions'), icon: 'bi-clock-history',         route: '/transactions' },
      { label: this.lang.t('nav_pending'),      icon: 'bi-exclamation-triangle',  route: '/pending'      },
      { label: this.lang.t('nav_settlement'),   icon: 'bi-check-circle',          route: '/settlement'   },
      { label: this.lang.t('nav_reports'),      icon: 'bi-file-earmark-bar-graph',route: '/reports'      },
    ];
  }

  get userName(): string {
    return this.dataService.getCurrentUser()?.name || 'User';
  }

  get userInitial(): string {
    return this.userName.charAt(0).toUpperCase();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    this.cdr.markForCheck();
  }

  toggleUserDropdown(): void {
    this.userDropdownOpen = !this.userDropdownOpen;
    this.cdr.markForCheck();
  }

  closeUserDropdown(): void {
    this.userDropdownOpen = false;
    this.cdr.markForCheck();
  }

  logout(): void {
    this.dataService.logout();
    this.router.navigate(['/login']);
  }

  onBackdropClick(): void {
    this.sidebarOpen = false;
    this.cdr.markForCheck();
  }

  toggleLanguage(): void {
    this.lang.toggle();
  }
}
