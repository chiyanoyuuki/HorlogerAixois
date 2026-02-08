import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Movementscomplic } from '../movementscomplic/movementscomplic';
import { Service } from '../service';

@Component({
  selector: 'app-horology',
  imports: [FormsModule, CommonModule, Movementscomplic],
  templateUrl: './horology.html',
  styleUrl: './horology.scss',
})
export class Horology {
  constructor(public app: Service) {}
}
