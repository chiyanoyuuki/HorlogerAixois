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

  constructor(
    public app: Service,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('reference');
      if (!id) return;
      this.indexImg = 0;

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
