import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Lastarrival } from '../lastarrival/lastarrival';
import { Service } from '../service';

@Component({
  selector: 'app-home',
  imports: [FormsModule, CommonModule, Lastarrival],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  image = 0;

  constructor(public app: Service) {}

  ngOnInit() {
    setInterval(() => {
      this.image++;
    }, 5000);
  }

  onMontreClick(event: any) {
    console.log(event);
    this.app.clickMenu('watch', event);
  }
}
