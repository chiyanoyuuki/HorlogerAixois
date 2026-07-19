import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
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
  lightboxOpen = false;
  similar: any[] = [];

  constructor(
    public app: Service,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('reference');
      if (!id) return;
      this.indexImg = 0;

      this.montreClicked =
        this.app.montres?.find((m: any) => m.otherData?.reference == id) ??
        this.app.loadMontreById(id);

      this.similar = this.computeSimilar();
    });
  }

  /**
   * Classe les autres montres par proximité avec la montre affichée
   * (marque, type de mouvement, calibre, matière de boîtier, année proche).
   */
  private computeSimilar(): any[] {
    const cur = this.montreClicked;
    if (!cur || !this.app.montres) return [];

    const num = (v: any) => {
      const n = parseInt(String(v ?? '').replace(/\D+/g, ''), 10);
      return isNaN(n) ? null : n;
    };
    const curYear = num(cur.year);

    const score = (m: any) => {
      let s = 0;
      if (m.brand && m.brand === cur.brand) s += 4;
      if (m.movementType && m.movementType === cur.movementType) s += 2;
      if (m.caliber && m.caliber === cur.caliber) s += 2;
      if (m.case && m.case === cur.case) s += 1;
      const y = num(m.year);
      if (curYear != null && y != null && Math.abs(curYear - y) <= 10) s += 1;
      return s;
    };

    return this.app.montres
      .filter((m: any) => m.id !== cur.id)
      .map((m: any) => ({ m, s: score(m) }))
      .sort((a: any, b: any) => b.s - a.s)
      .slice(0, 10)
      .map((x: any) => x.m);
  }

  get images(): string[] {
    return this.montreClicked?.otherData?.images ?? [];
  }

  imgUrl(image: string): string {
    return `${this.app.link}watches/${this.montreClicked.id}/${image}`;
  }

  select(i: number) {
    this.indexImg = i;
  }

  nextImg() {
    if (!this.images.length) return;
    this.indexImg = (this.indexImg + 1) % this.images.length;
  }

  prevImg() {
    if (!this.images.length) return;
    this.indexImg = (this.indexImg - 1 + this.images.length) % this.images.length;
  }

  openLightbox() {
    if (this.images.length) this.lightboxOpen = true;
  }

  closeLightbox() {
    this.lightboxOpen = false;
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (!this.lightboxOpen) return;
    if (e.key === 'Escape') this.closeLightbox();
    else if (e.key === 'ArrowRight') this.nextImg();
    else if (e.key === 'ArrowLeft') this.prevImg();
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
