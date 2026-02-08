import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Movementscomplic } from '../movementscomplic/movementscomplic';
import { Service } from '../service';

@Component({
  selector: 'app-workshop',
  imports: [FormsModule, CommonModule, Movementscomplic],
  templateUrl: './workshop.html',
  styleUrl: './workshop.scss',
})
export class Workshop implements OnInit {
  constructor(public app: Service) {}

  globalIndex = 0;
  intervalId: any;

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.globalIndex++;
    }, 3000);
  }

  getIndex(outil: any): number {
    return this.globalIndex % outil.img.length;
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }
}
