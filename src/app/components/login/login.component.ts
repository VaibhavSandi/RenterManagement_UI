import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(private dataService: MockDataService, private router: Router) {}

  onLogin(): void {
    this.isLoading = true;
    this.errorMessage = '';
    setTimeout(() => {
      this.dataService.login(this.username, this.password).subscribe(user => {
        this.isLoading = false;
        if (user) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Invalid username or password';
        }
      });
    }, 800);
  }
}
