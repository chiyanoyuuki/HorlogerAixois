import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Lastarrival } from '../lastarrival/lastarrival';
import { Service } from '../service';

@Component({
  selector: 'app-watches',
  imports: [FormsModule, CommonModule, Lastarrival],
  templateUrl: './watches.html',
  styleUrl: './watches.scss',
})
export class Watches {
  constructor(public app: Service) {}

  onMontreClick(event: any) {
    this.app.clickMenu('watch', event);
  }
}
