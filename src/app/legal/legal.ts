import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Service } from '../service';

@Component({
  selector: 'app-legal',
  imports: [FormsModule, CommonModule],
  templateUrl: './legal.html',
  styleUrl: './legal.scss',
})
export class Legal {
  constructor(public app: Service) {}
}
