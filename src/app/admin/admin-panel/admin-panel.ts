import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Admin } from '../admin.service';
import { AdminNode } from '../admin-node/admin-node';
import { humanize } from '../label-map';

interface Tab {
  key: string;
  label: string;
}

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNode],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.scss',
})
export class AdminPanel {
  activeTab = 'home';

  // Formulaire d'ajout / édition de montre
  editingWatch: any = null;
  watchForm: Record<string, any> = {};
  newImages: File[] = [];
  imagePreviews: string[] = [];
  submitting = false;

  /** Ordre & libellés des onglets de contenu (ceux présents dans data). */
  private contentOrder = [
    'home',
    'shop',
    'workshop',
    'horology',
    'about',
    'contact',
    'menus',
    'fr',
    'en',
    'blocs',
    'ordre',
  ];

  constructor(public admin: Admin) {}

  get data(): any {
    return this.admin.app.data;
  }

  get contentTabs(): Tab[] {
    if (!this.data) return [];
    return this.contentOrder
      .filter((k) => this.data[k] !== undefined)
      .map((k) => ({ key: k, label: humanize(k) }));
  }

  get montres(): any[] {
    return this.admin.app.montres ?? [];
  }

  selectTab(key: string) {
    this.activeTab = key;
  }

  close() {
    this.admin.panelOpen = false;
  }

  // ---- Gestion des montres ---------------------------------------------

  get watchFields(): { id: string; label: string }[] {
    const ordre = this.data?.ordre ?? [];
    const base = [
      { id: 'reference', fr: 'Référence', en: 'Reference' },
      { id: 'price', fr: 'Prix', en: 'Price' },
    ];
    const lg = this.admin.app.lg;
    return [...base, ...ordre]
      .filter((f: any) => f.id !== 'created_at')
      .map((f: any) => ({ id: f.id, label: f[lg] ?? f.fr ?? f.id }));
  }

  startAddWatch() {
    this.editingWatch = null;
    this.watchForm = {};
    this.clearImages();
  }

  startEditWatch(watch: any) {
    this.editingWatch = watch;
    this.watchForm = {};
    for (const f of this.watchFields) {
      if (f.id === 'reference') this.watchForm[f.id] = watch?.otherData?.reference ?? '';
      else this.watchForm[f.id] = watch?.[f.id] ?? '';
    }
    this.clearImages();
  }

  cancelWatchForm() {
    this.editingWatch = null;
    this.watchForm = {};
    this.clearImages();
  }

  onImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.clearImages();
    this.newImages = Array.from(input.files);
    this.imagePreviews = this.newImages.map((f) => URL.createObjectURL(f));
  }

  private clearImages() {
    this.imagePreviews.forEach((u) => URL.revokeObjectURL(u));
    this.imagePreviews = [];
    this.newImages = [];
  }

  watchImageUrl(watch: any): string | null {
    const imgs = watch?.otherData?.images;
    if (imgs && imgs.length) return `${this.admin.link}watches/${watch.id}/${imgs[0]}`;
    return null;
  }

  async submitWatch() {
    if (this.submitting) return;
    const fields: Record<string, any> = {};
    for (const f of this.watchFields) {
      if (this.watchForm[f.id] !== undefined && this.watchForm[f.id] !== '') {
        fields[f.id] = this.watchForm[f.id];
      }
    }
    this.submitting = true;
    let ok = false;
    if (this.editingWatch) {
      ok = await this.admin.updateWatch(this.editingWatch, fields, this.newImages);
    } else {
      ok = await this.admin.addWatch(fields, this.newImages);
    }
    this.submitting = false;
    if (ok) this.cancelWatchForm();
  }

  async removeWatch(watch: any) {
    if (!confirm(`Supprimer la montre « ${watch?.otherData?.reference ?? watch.id} » ?`)) return;
    await this.admin.deleteWatch(watch.id);
  }
}
