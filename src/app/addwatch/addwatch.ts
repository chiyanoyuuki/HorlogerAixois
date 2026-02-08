import { CommonModule } from '@angular/common';
import { Component, isDevMode } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Service } from '../service';
import { HttpClient } from '@angular/common/http';

export interface WatchFieldDef {
  id: string; // clé brute du TXT (fr)
  fr: string;
  en: string;
  type: 'text' | 'number' | 'date';
}

export interface WatchInput {
  id: string; // clé TXT
  modelKey: string; // clé interne (brand, model…)
  label: string; // fr/en selon app.lg
  type: string;
  value: any; // valeur ou null
  fromTxt: boolean; // trouvé ou non
}

@Component({
  selector: 'app-addwatch',
  imports: [FormsModule, CommonModule],
  templateUrl: './addwatch.html',
  styleUrl: './addwatch.scss',
})
export class Addwatch {
  watchInputs: WatchInput[] = [];
  selectedWatch: any = {}; // tes données brutes
  montreIndex = 0;

  WATCH_FIELDS_ORDER: WatchFieldDef[] = [];
  link = 'http' + (isDevMode() ? '' : 's') + '://chiyanh.cluster031.hosting.ovh.net/';

  WATCH_LABELS: Record<string, { fr: string; en: string }> = {
    brand: {
      fr: 'Marque',
      en: 'Brand',
    },
    model: {
      fr: 'Modèle',
      en: 'Model',
    },
    year: {
      fr: 'Année',
      en: 'Year',
    },
    reference: {
      fr: 'Référence',
      en: 'Reference',
    },
    serialNumber: {
      fr: 'Numéro de série',
      en: 'Serial number',
    },
    case: {
      fr: 'Boîtier',
      en: 'Case',
    },
    glass: {
      fr: 'Glace',
      en: 'Crystal',
    },
    caseBack: {
      fr: 'Fond',
      en: 'Case back',
    },
    crown: {
      fr: 'Couronne',
      en: 'Crown',
    },
    bezel: {
      fr: 'Lunette',
      en: 'Bezel',
    },
    dial: {
      fr: 'Cadran',
      en: 'Dial',
    },
    indexes: {
      fr: 'Index',
      en: 'Indexes',
    },
    strap: {
      fr: 'Bracelet',
      en: 'Strap',
    },
    buckle: {
      fr: 'Boucle',
      en: 'Buckle',
    },
    buckleWidth: {
      fr: 'Largeur de boucle',
      en: 'Buckle width',
    },
    lugWidth: {
      fr: 'Entrecorne',
      en: 'Lug width',
    },
    wristSize: {
      fr: 'Tour de poignet',
      en: 'Wrist size',
    },
    movementType: {
      fr: 'Type de mouvement',
      en: 'Movement type',
    },
    caliber: {
      fr: 'Calibre',
      en: 'Caliber',
    },
    powerReserve: {
      fr: 'Réserve de marche',
      en: 'Power reserve',
    },
    frequency: {
      fr: 'Fréquence',
      en: 'Frequency',
    },
    waterResistance: {
      fr: 'Étanchéité',
      en: 'Water resistance',
    },
    box: {
      fr: 'Boîte',
      en: 'Box',
    },
    papers: {
      fr: 'Papiers',
      en: 'Papers',
    },
    price: {
      fr: 'Prix',
      en: 'Price',
    },
    internalRef: {
      fr: 'Référence interne',
      en: 'Internal reference',
    },
    rubis: {
      fr: 'Rubis',
      en: 'Rubis',
    },
    partsCount: {
      fr: 'Nombre de pièces',
      en: 'Parts Count',
    },
    diameter: {
      fr: 'Diametre',
      en: 'Diameter',
    },
    thick: {
      fr: 'Epaisseur',
      en: 'Thick',
    },
  };

  WATCH_MAPPING: Record<string, string> = {
    marque: 'brand',
    modele: 'model',
    annee: 'year',
    reference: 'reference',
    'nde serie': 'serialNumber',
    'numero de serie': 'serialNumber',
    boitier: 'case',
    glace: 'glass',
    fond: 'caseBack',
    couronne: 'crown',
    lunette: 'bezel',
    cadran: 'dial',
    index: 'indexes',
    bracelet: 'strap',
    boucle: 'buckle',
    'largeur de boucle': 'buckleWidth',
    entrecorne: 'lugWidth',
    'tour de poignet': 'wristSize',
    'type de mouvement': 'movementType',
    mouvement: 'movementType',
    calibre: 'caliber',
    'reserve de marche': 'powerReserve',
    frequence: 'frequency',
    etanche: 'waterResistance',
    etancheite: 'waterResistance',
    boite: 'box',
    papiers: 'papers',
    prix: 'price',
    'ref interne': 'internalRef',
    rubis: 'rubis',
    'nombre de pieces': 'partsCount',
    'nombres de pieces': 'partsCount',
    diametre: 'diameter',
    epaisseur: 'thick',
  };

  paths: any = [];
  watches: any[] = [];
  loading = false;

  constructor(
    public app: Service,
    public http: HttpClient,
  ) {}

  ngOnInit() {
    this.WATCH_FIELDS_ORDER = this.app.data.ordre;
  }

  async onRootFolderSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    const watchFolders = this.extractValidWatchFolders(files);

    this.watches = await this.buildAllWatches(watchFolders);

    this.montreSuivante();
  }

  montreSuivante() {
    if (this.selectedWatch?.img) {
      this.selectedWatch.img.forEach((file: File | { url: string }) => {
        if (file instanceof File && (file as any).previewUrl) {
          URL.revokeObjectURL((file as any).previewUrl);
        }
      });
    }

    this.selectedWatch = this.watches[this.montreIndex] ?? null;
    console.log(this.selectedWatch);
    console.log(this.paths[this.montreIndex]);
    this.montreIndex = this.montreIndex + 1;

    if (this.app.montres.find((m: any) => m.otherData.reference == this.selectedWatch.reference))
      this.montreSuivante();

    this.loading = false;

    this.buildWatchInputs(this.selectedWatch, this.app.lg == 'fr' ? 'fr' : 'en');
  }

  objectKeys = Object.keys;

  getLabel(key: string): string {
    if (key == 'img') return 'Images';
    return this.app.lg == 'fr' ? this.WATCH_LABELS[key].fr : this.WATCH_LABELS[key].en;
  }

  extractValidWatchFolders(files: File[]) {
    console.log('extractValidWatchFolders called');
    const folders: Record<
      string,
      {
        folderPath: string;
        textFile?: File;
        images: File[];
      }
    > = {};

    files.forEach((file) => {
      const path = file.webkitRelativePath;
      const folderPath = path.substring(0, path.lastIndexOf('/'));

      if (!folders[folderPath]) {
        folders[folderPath] = {
          folderPath,
          images: [],
        };
      }

      if (file.name.toLowerCase().endsWith('.txt')) {
        folders[folderPath].textFile = file;
      } else if (file.type.startsWith('image/')) {
        folders[folderPath].images.push(file);
      }
    });

    // ✅ on retourne UNIQUEMENT les dossiers valides
    return Object.values(folders).filter((f) => f.textFile && f.images.length > 0);
  }

  readTextFile(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsText(file);
    });
  }

  parseWatchText(content: string): Record<string, any> {
    const result: Record<string, any> = {};

    const normalize = (str: string) =>
      str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/°/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const lines = content.split('\n');

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      const lineNormalized = normalize(line);

      // Cherche une correspondance avec chaque clé du mapping
      for (const [rawKey, mappedKey] of Object.entries(this.WATCH_MAPPING)) {
        const normalizedKey = normalize(rawKey);

        if (
          lineNormalized.startsWith(normalizedKey + ' ') || // clé + espace
          lineNormalized === normalizedKey // ligne exactement la clé
        ) {
          // Récupère tout après le nom de la clé
          let value = line.slice(rawKey.length).trim();

          // Si la ligne contient un ':', on prend ce qui vient après
          if (value.startsWith(':')) {
            value = value.slice(1).trim();
          }

          result[mappedKey] = value;
          break; // passe à la ligne suivante
        }
      }
    }

    return result;
  }

  async buildWatchJson(folder: any) {
    const textContent = await this.readTextFile(folder.textFile);
    const parsedData = this.parseWatchText(textContent);
    this.paths.push(folder.folderPath);

    // ✅ Si brand est vide, on prend le nom du dossier parent
    if (!parsedData['brand']) {
      const segments = folder.folderPath.split('/');
      const folderName = segments[1];
      parsedData['brand'] = folderName.charAt(0).toUpperCase() + folderName.slice(1).toLowerCase();
    }

    if (!parsedData['model']) {
      const segments = folder.folderPath.split('/');
      const folderName = segments[2] ? segments[2] : '';
      parsedData['model'] = folderName.charAt(0).toUpperCase() + folderName.slice(1).toLowerCase();
    }

    return {
      ...parsedData,
      // 🔹 garder les fichiers File originaux pour l'upload
      img: folder.images,
    };
  }

  async buildAllWatches(validFolders: any[]) {
    const results = [];

    for (const folder of validFolders) {
      const watch = await this.buildWatchJson(folder);
      results.push(watch);
    }

    return results;
  }

  buildWatchInputs(rawWatch: Record<string, any>, lang: 'fr' | 'en') {
    const inputs: WatchInput[] = [];
    const usedKeys = new Set<string>();

    // 1️⃣ Champs dans l'ordre, valeur vide si absente
    for (const field of this.WATCH_FIELDS_ORDER) {
      const modelKey = field.id;

      const value = rawWatch[modelKey] ?? ''; // valeur vide si non trouvée

      if (field.id == 'arrival') continue;

      if (value !== '') {
        usedKeys.add(modelKey);
      }

      inputs.push({
        id: field.id,
        modelKey,
        label: this.WATCH_LABELS[modelKey]?.[lang] || field[lang],
        type: field.type,
        value,
        fromTxt: value !== '',
      });
    }

    // 2️⃣ Champs supplémentaires trouvés dans rawWatch
    for (const [key, value] of Object.entries(rawWatch)) {
      if (usedKeys.has(key) || key === 'img') continue; // ignorer les champs déjà affichés et images

      inputs.push({
        id: key,
        modelKey: key,
        label: this.WATCH_LABELS[key]?.[lang] || key,
        type: 'text',
        value,
        fromTxt: true,
      });
    }

    this.watchInputs = inputs;
  }

  getFileUrl(file: File | string): string {
    // Si c'est déjà une URL (après upload), on la retourne
    if (typeof file === 'string') return file;

    // Sinon c'est un File local => on crée un URL temporaire pour l'aperçu
    return URL.createObjectURL(file);
  }

  okwatch() {
    this.saveWatch();
  }

  async saveWatch() {
    const watch = this.selectedWatch;
    const images = watch.img || [];

    const formData = new FormData();

    this.loading = true;

    Object.keys(watch).forEach((key) => {
      if (key !== 'otherData' && key !== 'img') {
        formData.append(key, watch[key] ?? '');
      }
    });

    if (watch.otherData) {
      formData.append('otherData', JSON.stringify(watch.otherData));
    }

    for (const file of images) {
      if (file instanceof File) {
        const compressed = await this.compressImage(file, 1); // 1 Mo max
        formData.append('images[]', compressed);
      }
    }

    this.http.post(this.link + 'montreshorloger.php', formData).subscribe(() => {
      this.montreSuivante();
    });
  }

  async compressImage(file: File, maxSizeMB = 1, qualityStep = 0.9): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target!.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // On réduit l'image proportionnellement si trop grande
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920; // optionnel, pour limiter taille
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        let quality = qualityStep;

        function tryCompress() {
          canvas.toBlob(
            async (blob) => {
              if (!blob) return reject('Compression failed');
              if (blob.size / 1024 / 1024 > maxSizeMB && quality > 0.1) {
                quality *= 0.8;
                tryCompress();
              } else {
                // On reconvertit en File pour garder le nom original
                resolve(new File([blob], file.name, { type: file.type }));
              }
            },
            file.type,
            quality,
          );
        }

        tryCompress();
      };

      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
}
