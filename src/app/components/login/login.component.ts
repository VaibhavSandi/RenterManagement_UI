import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit, OnDestroy {
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;
  private langSub!: Subscription;

  constructor(
    private dataService: MockDataService,
    private router: Router,
    public lang: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.langSub = this.lang.lang$.subscribe(() => this.cdr.markForCheck());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  onLogin(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();
    setTimeout(() => {
      this.dataService.login(this.username, this.password).subscribe(user => {
        this.isLoading = false;
        if (user) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = this.lang.t('login_error');
        }
        this.cdr.markForCheck();
      });
    }, 800);
  }
}
