import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  hidePass = true;
  loading = false;
  errorMsg = '';
  rememberMe = false;
  userFocused = false;
  passFocused = false;
  currentYear = new Date().getFullYear();

  constructor(private fb: FormBuilder, private auth: AuthService) {}

  onRememberMeChange(event: Event) {
    this.rememberMe = (event.target as HTMLInputElement).checked;
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';

    const { username, password } = this.form.value;
    this.auth.login(username!, password!).subscribe({
      next: () => { this.loading = false; },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Invalid username or password. Please try again.';
      }
    });
  }
}
