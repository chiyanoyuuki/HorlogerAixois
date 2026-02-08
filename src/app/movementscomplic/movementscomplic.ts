import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Service } from '../service';

@Component({
  selector: 'app-movementscomplic',
  imports: [CommonModule, FormsModule],
  templateUrl: './movementscomplic.html',
  styleUrl: './movementscomplic.scss',
})
export class Movementscomplic {
  @Input() montres: any;
  @Input() lg: any;
  @Input() data: any;
  @Input() polish: any = false;
  constructor(public app: Service) {}
}
