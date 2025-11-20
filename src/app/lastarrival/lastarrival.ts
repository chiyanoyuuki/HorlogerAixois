import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lastarrival',
  imports: [CommonModule, FormsModule],
  templateUrl: './lastarrival.html',
  styleUrl: './lastarrival.scss',
})
export class Lastarrival implements OnInit, AfterViewInit {
  @Input() mobile: any = false;
  @Input() montres: any;
  @Input() lg: any;
  @Input() data: any;
  @Input() title: any;
  @Input() tri: any;
  @Input() filter: any;
  @Input() catalog = false;
  @Input() forceSearch = false;

  @Output() montreClick = new EventEmitter<any>();

  @ViewChild('montresContainer') montresContainer!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  scroll = 0;
  filterClicked: any = 0;
  menus: any;
  showContent = true;
  totfiltres: any = [];
  tottri: any = [];
  montresActuelles: any = [];
  selectedFilter: any;
  search = '';

  ngOnInit() {
    this.montresActuelles = this.montres;
    if (this.filter) {
      this.menus = [...new Set(this.montres.map((item: any) => item[this.lg][this.filter]))];
      this.getMontres(0);
    }
    this.trier();

    this.data.ordre.forEach((f: any) => {
      let tmp = [...new Set(this.montresActuelles.map((item: any) => item[this.lg][f.id]))];
      if (tmp.length > 1) {
        this.tottri.push(f);
        if (f.id != 'arrivee') this.totfiltres.push(f);
      }
    });

    this.selectedFilter = this.totfiltres.sort((a: any, b: any) => {
      return String(a[this.lg]).localeCompare(String(b[this.lg]));
    })[0];
  }

  ngAfterViewInit() {
    if (this.forceSearch) this.searchInput.nativeElement.focus();
  }

  getOrdres() {
    return this.tottri.sort((a: any, b: any) => {
      return String(a[this.lg]).localeCompare(String(b[this.lg]));
    });
  }

  getFilterOrdres() {
    return this.totfiltres
      .filter((o: any) => !o.selected)
      .sort((a: any, b: any) => {
        return String(a[this.lg]).localeCompare(String(b[this.lg]));
      });
  }

  addFilter() {
    this.selectedFilter.selected = true;
    if (this.getFilterOrdres().length > 0) this.selectedFilter = this.getFilterOrdres()[0];
  }

  hasFilter() {
    return this.totfiltres.find((t: any) => t.selected);
  }

  hasActiveFilter() {
    return this.totfiltres.find((t: any) => t.excluded && t.excluded.length > 0);
  }

  deleteFilters() {
    this.totfiltres.forEach((t: any) => {
      t.excluded = [];
      t.selected = false;
    });
  }

  deleteActiveFilters() {
    this.totfiltres.forEach((t: any) => (t.excluded = []));
  }

  deleteFilter(filt: any) {
    filt.excluded = [];
    filt.selected = false;
  }

  getTri(montre: any) {
    if (this.tri == 'marque' || this.tri == 'reference' || this.tri == 'modele') return '';
    return (
      this.data.ordre.find((o: any) => o.id == this.tri)[this.lg] +
      '<br/>' +
      montre[this.lg][this.tri]
    );
  }

  getFilterMenus(filt: any) {
    let menus = [...new Set(this.montresActuelles.map((item: any) => item[this.lg][filt.id]))];
    return menus;
  }

  addExcluded(filter: any, j: any) {
    if (!filter.excluded) filter.excluded = [];
    const exist = filter.excluded.includes(j);
    if (!exist) {
      filter.excluded.push(j);
    } else {
      filter.excluded.splice(filter.excluded.indexOf(j), 1);
    }
  }

  isClicked(i: any, j: any) {
    if (!this.totfiltres[i].excluded) return;
    return this.totfiltres[i].excluded.includes(j);
  }

  isDisabled(filter: any, filtermenu: any) {
    return !this.getMontresActuelles().some((m: any) => m[this.lg][filter.id] == filtermenu);
  }

  onTriChange(event: any) {
    this.showContent = false;
    let int = setInterval(() => {
      let value = (event.target as HTMLSelectElement).value;
      this.tri = value;
      this.trier();
      let int2 = setInterval(() => {
        this.showContent = true;
        clearInterval(int2);
      }, 100);
      clearInterval(int);
    }, 500);
  }

  trier() {
    if (this.tri) {
      let type = this.data.ordre.find((o: any) => o.id == this.tri)!.type;

      this.montresActuelles = this.montres.sort((a: any, b: any) => {
        const va = a[this.lg][this.tri];
        const vb = b[this.lg][this.tri];

        if (type === 'text') {
          return String(va).localeCompare(String(vb));
        }

        if (type === 'date') {
          if (type === 'date') {
            const pa = this.parseDate(va);
            const pb = this.parseDate(vb);
            return pa - pb;
          }
        }

        if (type === 'number') {
          const na = Number(String(va).replace(/\D+/g, '')) || 0;
          const nb = Number(String(vb).replace(/\D+/g, '')) || 0;
          return na - nb;
        }

        return 0;
      });
    }
  }

  nextPage(nb: number) {
    if (nb == -1) {
      if (this.scroll > 0) this.scroll = this.scroll - 1;
    } else {
      if (this.scroll < this.montres.length - 1) this.scroll = this.scroll + 1;
    }

    let comp = this.montresContainer;

    const firstMontre: HTMLElement = comp.nativeElement.querySelector('.montre');
    const width = firstMontre.offsetWidth;
    comp.nativeElement.scrollTo({ left: this.scroll * width, behavior: 'smooth' });
  }

  clickMontre(montre: any) {
    this.montreClick.emit(montre);
  }

  private parseDate(value: string): number {
    if (!value) return 0;

    // format AAAA
    if (/^\d{4}$/.test(value)) {
      return new Date(Number(value), 0, 1).getTime();
    }

    // format DD/MM/AAAA
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [d, m, y] = value.split('/').map((n) => Number(n));
      return new Date(y, m - 1, d).getTime();
    }

    return 0;
  }

  getMontres(i: any) {
    this.filterClicked = i;
    this.montresActuelles = this.montres.filter(
      (m: any) => m[this.lg][this.filter] == this.menus[this.filterClicked]
    );
  }

  clickMenu(i: any) {
    this.showContent = false;
    let int = setInterval(() => {
      this.getMontres(i);
      let int2 = setInterval(() => {
        this.showContent = true;
        clearInterval(int2);
      }, 100);
      clearInterval(int);
    }, 500);
  }

  getMontresActuelles() {
    let montres = this.montresActuelles;
    if (this.catalog) {
      if (this.search != '') {
        const q = this.search.trim().toLowerCase();
        montres = montres
          .map((montre: any) => {
            let score = 0;

            // Pour chaque propriété, on vérifie si elle contient la recherche
            for (const key of Object.keys(montre[this.lg])) {
              const valeur = String((montre as any)[this.lg][key]).toLowerCase();
              if (valeur.includes(q)) {
                score++;
              }
            }

            return { ...montre, score };
          })
          .filter((m: any) => m.score > 0);
      }
      this.totfiltres
        .filter((f: any) => f.selected)
        .forEach((f: any) => {
          if (f.excluded && f.excluded.length > 0) {
            let filters = this.getFilterMenus(f);
            for (let i = 0; i < filters.length; i++) {
              if (!f.excluded.includes(i)) {
                montres = montres.filter((m: any) => m[this.lg][f.id] != filters[i]);
              }
            }
          }
        });
    }
    return montres;
  }

  highlight(text: string): string {
    if (!this.search || !text) return text;

    const q = this.search.trim().toLowerCase();
    const regex = new RegExp(q, 'gi');

    return text.replace(regex, (match) => `<span class="highlight">${match}</span>`);
  }

  getFilters() {
    return this.totfiltres.filter((f: any) => f.selected);
  }
}
