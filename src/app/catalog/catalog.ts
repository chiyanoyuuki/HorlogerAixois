import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Service } from '../service';

interface Facet {
  id: string;
  label: string;
  values: string[];
  selected: Set<string>;
  open: boolean;
}

/**
 * Catalogue de montres : recherche, facettes de filtres (inclusives) et tri,
 * dans une grille responsive. Remplace l'ancien mode « catalog » de
 * lastarrival, jugé peu pratique.
 *
 * Les caractéristiques d'une montre peuvent être soit des colonnes de premier
 * niveau (brand, model…), soit rangées dans `otherData` (reference, price…).
 * `val()` lit indifféremment les deux.
 */
@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.scss',
})
export class Catalog implements OnInit {
  @Output() montreClick = new EventEmitter<any>();

  search = '';
  sortId = 'created_at';
  sortDir: 'asc' | 'desc' = 'desc';
  showFilters = false;
  facets: Facet[] = [];

  constructor(public app: Service) {}

  ngOnInit() {
    this.buildFacets();
    // Tri par défaut : les plus récentes d'abord si la donnée existe.
    if (!this.hasField('created_at')) this.sortId = 'reference';
  }

  private get montres(): any[] {
    return this.app.montres ?? [];
  }

  /** Lit une valeur de champ où qu'elle soit (colonne ou otherData). */
  val(montre: any, id: string): string {
    if (montre == null) return '';
    if (id === 'reference') return montre.otherData?.reference ?? montre.reference ?? '';
    const top = montre[id];
    if (top !== undefined && top !== null && top !== '') return String(top);
    const other = montre.otherData?.[id];
    return other !== undefined && other !== null ? String(other) : '';
  }

  private hasField(id: string): boolean {
    return this.montres.some((m) => this.val(m, id) !== '');
  }

  private buildFacets() {
    const ordre = this.app.data?.ordre ?? [];
    const lg = this.app.lg;
    this.facets = [];
    for (const f of ordre) {
      if (f.id === 'created_at') continue;
      const values = Array.from(
        new Set(this.montres.map((m) => this.val(m, f.id)).filter((v) => v !== '')),
      ).sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }));
      if (values.length > 1) {
        this.facets.push({
          id: f.id,
          label: f[lg] ?? f.fr ?? f.id,
          values,
          selected: new Set<string>(),
          open: false,
        });
      }
    }
  }

  get sortOptions(): { id: string; label: string }[] {
    const ordre = this.app.data?.ordre ?? [];
    const lg = this.app.lg;
    const opts = ordre
      .filter((f: any) => this.hasField(f.id))
      .map((f: any) => ({ id: f.id, label: f[lg] ?? f.fr ?? f.id }));
    if (this.hasField('reference') && !opts.find((o: any) => o.id === 'reference')) {
      opts.unshift({ id: 'reference', label: this.app.lg === 'fr' ? 'Référence' : 'Reference' });
    }
    return opts;
  }

  toggleFacetValue(facet: Facet, value: string) {
    if (facet.selected.has(value)) facet.selected.delete(value);
    else facet.selected.add(value);
  }

  toggleFacetOpen(facet: Facet) {
    facet.open = !facet.open;
  }

  get activeFilterCount(): number {
    return this.facets.reduce((n, f) => n + f.selected.size, 0);
  }

  clearFilters() {
    this.facets.forEach((f) => f.selected.clear());
    this.search = '';
  }

  setSort(id: string) {
    if (this.sortId === id) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortId = id;
      this.sortDir = id === 'created_at' ? 'desc' : 'asc';
    }
  }

  // --- Résultats ---------------------------------------------------------

  private matchesSearch(montre: any, q: string): boolean {
    if (!q) return true;
    const haystack: string[] = [];
    for (const k of Object.keys(montre)) {
      if (k === 'otherData') continue;
      haystack.push(String(montre[k]));
    }
    if (montre.otherData) {
      for (const k of Object.keys(montre.otherData)) {
        if (k === 'images') continue;
        haystack.push(String(montre.otherData[k]));
      }
    }
    return haystack.join(' ').toLowerCase().includes(q);
  }

  private matchesFacets(montre: any): boolean {
    for (const f of this.facets) {
      if (f.selected.size === 0) continue;
      if (!f.selected.has(this.val(montre, f.id))) return false;
    }
    return true;
  }

  private compare(a: any, b: any): number {
    const va = this.val(a, this.sortId);
    const vb = this.val(b, this.sortId);
    const dir = this.sortDir === 'asc' ? 1 : -1;

    // Nombres (prix, année, réserve…) : comparaison numérique si possible.
    const na = parseFloat(String(va).replace(',', '.').replace(/[^\d.-]/g, ''));
    const nb = parseFloat(String(vb).replace(',', '.').replace(/[^\d.-]/g, ''));
    const bothNum = !isNaN(na) && !isNaN(nb) && String(va).match(/\d/) && String(vb).match(/\d/);
    if (bothNum && na !== nb) return (na - nb) * dir;

    return va.localeCompare(vb, 'fr', { numeric: true }) * dir;
  }

  get results(): any[] {
    const q = this.search.trim().toLowerCase();
    return this.montres
      .filter((m) => this.matchesSearch(m, q) && this.matchesFacets(m))
      .slice()
      .sort((a, b) => this.compare(a, b));
  }

  imageUrl(montre: any): string | null {
    const imgs = montre?.otherData?.images;
    if (imgs && imgs.length) return `${this.app.link}watches/${montre.id}/${imgs[0]}`;
    return null;
  }

  price(montre: any): string {
    return this.val(montre, 'price');
  }

  clickMontre(montre: any) {
    this.montreClick.emit(montre);
  }

  highlight(text: string): string {
    const q = this.search.trim();
    if (!q || !text) return text ?? '';
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return String(text).replace(new RegExp(safe, 'gi'), (m) => `<span class="highlight">${m}</span>`);
  }

  trackById(_i: number, m: any) {
    return m.id;
  }
}
