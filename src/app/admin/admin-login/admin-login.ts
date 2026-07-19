import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Admin } from '../admin.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss',
})
export class AdminLogin {
  password = '';
  error = false;

  constructor(
    public admin: Admin,
    private router: Router,
  ) {}

  submit() {
    this.error = false;
    if (this.admin.login(this.password)) {
      this.password = '';
      this.admin.panelOpen = true;
      this.router.navigate(['home']);
    } else {
      this.error = true;
    }
  }

  openPanel() {
    this.admin.panelOpen = true;
    this.router.navigate(['home']);
  }
}
