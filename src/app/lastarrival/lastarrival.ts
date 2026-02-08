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
import { Service } from '../service';

@Component({
  selector: 'app-lastarrival',
  imports: [CommonModule, FormsModule],
  templateUrl: './lastarrival.html',
  styleUrl: './lastarrival.scss',
})
export class Lastarrival implements OnInit, AfterViewInit {
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

  constructor(public app: Service) {}

  ngOnInit() {
    this.montresActuelles = this.app.montres;
    console.log('montresActuelles', this.montresActuelles);
    if (this.filter) {
      this.menus = [...new Set(this.app.montres.map((item: any) => item[this.filter]))];
      this.getMontres(0);
    }
    this.trier();

    this.app.data.ordre.forEach((f: any) => {
      console.log(this.montresActuelles);
      let tmp = [...new Set(this.montresActuelles.map((item: any) => item[f.id]))];
      if (tmp.length > 1) {
        this.tottri.push(f);
        if (f.id != 'arrivee') this.totfiltres.push(f);
      }
    });

    this.selectedFilter = this.totfiltres.sort((a: any, b: any) => {
      return String(a).localeCompare(String(b));
    })[0];
  }

  ngAfterViewInit() {
    if (this.forceSearch) this.searchInput.nativeElement.focus();
  }

  getOrdres() {
    return this.tottri.sort((a: any, b: any) => {
      return String(a).localeCompare(String(b));
    });
  }

  getFilterOrdres() {
    return this.totfiltres
      .filter((o: any) => !o.selected)
      .sort((a: any, b: any) => {
        return String(a).localeCompare(String(b));
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
    console.log(this.tri);
    if (this.tri == 'marque' || this.tri == 'reference' || this.tri == 'modele') return '';
    return (
      this.app.data.ordre.find((o: any) => o.id == this.tri)[this.app.lg] +
      '<br/>' +
      montre[this.tri]
    );
  }

  getFilterMenus(filt: any) {
    let menus = [...new Set(this.montresActuelles.map((item: any) => item[filt.id]))];
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
    return !this.getMontresActuelles().some((m: any) => m[filter.id] == filtermenu);
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
    if (!this.tri) return;

    this.montresActuelles = this.app.montres.sort((a: any, b: any) => {
      const va = a[this.tri];
      const vb = b[this.tri];

      const detectType = (val: any) => {
        if (val == null) return 'text';
        if (!isNaN(Number(String(val).replace(/\D+/g, '')))) return 'number';
        if (!isNaN(Date.parse(String(val)))) return 'date';
        return 'text';
      };

      const type = detectType(va);

      switch (type) {
        case 'text':
          return String(vb).localeCompare(String(va));
        case 'date':
          const pa = Date.parse(String(va)) || 0;
          const pb = Date.parse(String(vb)) || 0;
          return pb - pa;
        case 'number':
          const na = Number(String(va).replace(/\D+/g, '')) || 0;
          const nb = Number(String(vb).replace(/\D+/g, '')) || 0;
          return nb - na;
        default:
          return 0;
      }
    });
  }

  nextPage(nb: number) {
    if (nb == -1) {
      if (this.scroll > 0) this.scroll = this.scroll - 1;
    } else {
      if (this.scroll < this.app.montres.length - 1) this.scroll = this.scroll + 1;
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
    this.montresActuelles = this.app.montres.filter(
      (m: any) => m[this.filter] == this.menus[this.filterClicked],
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
            for (const key of Object.keys(montre)) {
              const valeur = String((montre as any)[key]).toLowerCase();
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
                montres = montres.filter((m: any) => m[f.id] != filters[i]);
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
