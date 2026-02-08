import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Lastarrival } from '../lastarrival/lastarrival';
import { Service } from '../service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-watch',
  imports: [FormsModule, CommonModule, Lastarrival],
  templateUrl: './watch.html',
  styleUrl: './watch.scss',
})
export class Watch implements OnInit {
  indexImg = 0;
  montreClicked: any;

  constructor(
    public app: Service,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('reference');
      if (!id) return;

      // 1. si déjà en mémoire dans le service
      const fromMemory = this.app.montres?.find((montre: any) => montre.otherData.reference == id);
      if (fromMemory) {
        this.montreClicked = fromMemory;
        return;
      }

      // 2. sinon : recharger / fallback propre
      this.montreClicked = this.app.loadMontreById(id);
    });
  }

  getFirstInfos() {
    return this.app.data.ordre.slice(0, 8);
  }
  getBotInfos() {
    return this.app.data.ordre.slice(8, 20);
  }

  onMontreClick(event: any) {
    this.app.clickMenu('watch', event);
  }
}
