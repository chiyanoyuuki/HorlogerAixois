import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Admin } from '../admin.service';
import { humanize } from '../label-map';

/**
 * Éditeur récursif d'un nœud de données.
 *
 * Reçoit un conteneur (`node`, objet ou tableau) et une `key` (nom de
 * propriété ou index) et affiche le bon contrôle selon le type de la valeur :
 * champ texte, zone de texte, nombre, case à cocher, ou groupe/liste
 * imbriqués (qui se ré-affichent via <admin-node> — récursivité).
 *
 * Les valeurs sont liées directement au conteneur (mutation en place), donc
 * chaque modification est immédiatement reflétée dans `app.data`.
 */
@Component({
  selector: 'admin-node',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNode],
  templateUrl: './admin-node.html',
  styleUrl: './admin-node.scss',
})
export class AdminNode {
  @Input() node: any;
  @Input() key!: string | number;
  @Input() label?: string;
  /** Cache un niveau de titre pour les listes racine plus compactes. */
  @Input() depth = 0;

  constructor(public admin: Admin) {}

  get value(): any {
    return this.node?.[this.key as any];
  }

  get displayLabel(): string {
    if (this.label != null) return this.label;
    if (typeof this.key === 'number') return `Élément ${this.key + 1}`;
    return humanize(String(this.key));
  }

  get valueType(): 'string' | 'number' | 'boolean' | 'array' | 'object' | 'empty' {
    const v = this.value;
    if (v === null || v === undefined) return 'empty';
    if (Array.isArray(v)) return 'array';
    if (typeof v === 'object') return 'object';
    if (typeof v === 'number') return 'number';
    if (typeof v === 'boolean') return 'boolean';
    return 'string';
  }

  get isLongText(): boolean {
    const v = this.value;
    return typeof v === 'string' && (v.length > 55 || v.includes('\n'));
  }

  objectKeys(v: any): string[] {
    return v ? Object.keys(v) : [];
  }

  onChange() {
    this.admin.markDirty();
  }

  // ---- Édition des listes ----------------------------------------------

  private cloneEmpty(sample: any): any {
    if (Array.isArray(sample)) return [];
    if (sample && typeof sample === 'object') {
      const out: any = {};
      for (const k of Object.keys(sample)) out[k] = this.cloneEmpty(sample[k]);
      return out;
    }
    if (typeof sample === 'number') return 0;
    if (typeof sample === 'boolean') return false;
    return '';
  }

  addItem() {
    if (!Array.isArray(this.value)) return;
    const sample = this.value.length ? this.value[this.value.length - 1] : '';
    this.value.push(this.cloneEmpty(sample));
    this.onChange();
  }

  removeItem(i: number) {
    if (!Array.isArray(this.value)) return;
    if (!confirm('Supprimer cet élément ?')) return;
    this.value.splice(i, 1);
    this.onChange();
  }

  move(i: number, dir: number) {
    if (!Array.isArray(this.value)) return;
    const j = i + dir;
    if (j < 0 || j >= this.value.length) return;
    [this.value[i], this.value[j]] = [this.value[j], this.value[i]];
    this.onChange();
  }

  trackByIndex(i: number) {
    return i;
  }
}
