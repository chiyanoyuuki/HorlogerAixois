import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Service } from '../service';

/**
 * Service d'administration.
 *
 * Sécurité : l'authentification est volontairement côté client (mot de passe
 * simple). Elle protège l'accès à l'interface d'édition mais N'EST PAS une
 * sécurité serveur — l'endpoint `sethorlogeraixois` est de toute façon ouvert
 * en écriture. Pour un vrai contrôle d'accès, ajouter un endpoint d'auth PHP
 * (voir ADMIN.md) et remplacer `login()`.
 *
 * Persistance :
 *  - Tout le contenu éditorial du site vit dans `app.data` et est enregistré
 *    en un seul appel `POST sethorlogeraixois`.
 *  - Les montres passent par `montreshorloger.php` (ajout confirmé ; la
 *    modification / suppression nécessitent le support backend décrit dans
 *    ADMIN.md).
 */
@Injectable({ providedIn: 'root' })
export class Admin {
  isAdmin = false;
  panelOpen = false;
  saving = false;
  dirty = false;
  message = '';
  messageError = false;

  /** ⚠️ À PERSONNALISER par le client. Mot de passe d'accès à l'admin. */
  private readonly PASSWORD = 'horloger2025';

  link = 'http' + (isDevMode() ? '' : 's') + '://chiyanh.cluster031.hosting.ovh.net/';

  /** Colonnes SQL de la table `horlogermontres` (le reste va dans otherData). */
  private readonly COLUMNS = [
    'brand', 'model', 'year', 'movementType', 'caliber',
    'powerReserve', 'frequency', 'waterResistance',
    'case', 'caseBack', 'glass', 'dial',
    'lugWidth', 'buckle', 'size', 'crown',
    'bezel', 'indexes', 'wristSize', 'buckleWidth',
  ];

  constructor(
    private http: HttpClient,
    public app: Service,
  ) {
    this.isAdmin = sessionStorage.getItem('ha_admin') === '1';
  }

  login(password: string): boolean {
    if (password === this.PASSWORD) {
      this.isAdmin = true;
      sessionStorage.setItem('ha_admin', '1');
      return true;
    }
    return false;
  }

  logout() {
    this.isAdmin = false;
    this.panelOpen = false;
    sessionStorage.removeItem('ha_admin');
  }

  togglePanel() {
    this.panelOpen = !this.panelOpen;
  }

  markDirty() {
    this.dirty = true;
  }

  flash(msg: string, error = false) {
    this.message = msg;
    this.messageError = error;
    setTimeout(() => (this.message = ''), 3500);
  }

  /** Enregistre l'intégralité du contenu éditorial du site. */
  save() {
    if (this.saving) return;
    this.saving = true;
    this.http
      .post<void>(this.link + 'sethorlogeraixois', this.app.data, {
        headers: { 'Content-Type': 'application/json' },
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.dirty = false;
          this.flash('Modifications enregistrées ✓');
        },
        error: () => {
          this.saving = false;
          this.flash("Erreur lors de l'enregistrement. Réessayez.", true);
        },
      });
  }

  /** Recharge les montres depuis le serveur. */
  reloadWatches() {
    this.app.getWatches();
  }

  /**
   * Ajoute une montre (données + images) via `montreshorloger.php`.
   * `fields` = paires clé/valeur des caractéristiques ; `images` = File[].
   */
  async addWatch(fields: Record<string, any>, images: File[]): Promise<boolean> {
    const formData = new FormData();
    Object.keys(fields).forEach((k) => formData.append(k, fields[k] ?? ''));
    for (const file of images) {
      const compressed = await this.compressImage(file, 1);
      formData.append('images[]', compressed);
    }
    return new Promise((resolve) => {
      this.http.post(this.link + 'montreshorloger.php', formData).subscribe({
        next: () => {
          this.flash('Montre ajoutée ✓');
          this.reloadWatches();
          resolve(true);
        },
        error: () => {
          this.flash("Erreur lors de l'ajout de la montre.", true);
          resolve(false);
        },
      });
    });
  }

  /**
   * Supprime une montre (POST `action=delete` + `id`). Nécessite le backend
   * `backend/montreshorloger.php` fourni (voir ADMIN.md).
   */
  deleteWatch(id: string | number): Promise<boolean> {
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', String(id));
    return new Promise((resolve) => {
      this.http.post(this.link + 'montreshorloger.php', formData).subscribe({
        next: () => {
          this.flash('Montre supprimée ✓');
          this.reloadWatches();
          resolve(true);
        },
        error: () => {
          this.flash('Suppression impossible.', true);
          resolve(false);
        },
      });
    });
  }

  /**
   * Met à jour une montre existante. Le backend actuel traite un POST avec
   * `id` comme un UPDATE. On préserve `otherData` (dont les images) en le
   * renvoyant fusionné avec les champs édités.
   */
  async updateWatch(
    watch: any,
    fields: Record<string, any>,
    images: File[] = [],
  ): Promise<boolean> {
    const formData = new FormData();
    formData.append('id', String(watch.id));

    // Colonnes : valeur éditée sinon valeur d'origine.
    for (const col of this.COLUMNS) {
      const v = fields[col] !== undefined ? fields[col] : watch[col];
      formData.append(col, v ?? '');
    }

    // otherData : on repart de l'existant (images…) puis on applique les
    // champs édités qui ne sont pas des colonnes.
    const otherData: Record<string, any> = { ...(watch.otherData ?? {}) };
    for (const key of Object.keys(fields)) {
      if (!this.COLUMNS.includes(key)) otherData[key] = fields[key];
    }
    formData.append('otherData', JSON.stringify(otherData));

    // Photos supplémentaires éventuelles (ajoutées à la suite côté serveur).
    for (const file of images) {
      const compressed = await this.compressImage(file, 1);
      formData.append('images[]', compressed);
    }

    return new Promise((resolve) => {
      this.http.post(this.link + 'montreshorloger.php', formData).subscribe({
        next: () => {
          this.flash('Montre mise à jour ✓');
          this.reloadWatches();
          resolve(true);
        },
        error: () => {
          this.flash('Mise à jour impossible.', true);
          resolve(false);
        },
      });
    });
  }

  /** Compression d'image côté client (identique au flux d'ajout existant). */
  private async compressImage(file: File, maxSizeMB = 1, qualityStep = 0.9): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => (img.src = e.target!.result as string);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920;
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width *= ratio;
          height *= ratio;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        let quality = qualityStep;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject('Compression failed');
              if (blob.size / 1024 / 1024 > maxSizeMB && quality > 0.1) {
                quality *= 0.8;
                tryCompress();
              } else {
                resolve(new File([blob], file.name, { type: file.type }));
              }
            },
            file.type,
            quality,
          );
        };
        tryCompress();
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
}
