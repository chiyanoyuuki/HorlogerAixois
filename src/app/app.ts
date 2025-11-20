import {
  Component,
  ElementRef,
  HostListener,
  isDevMode,
  OnInit,
  Renderer2,
  signal,
  ViewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Lastarrival } from './lastarrival/lastarrival';
import { Movementscomplic } from './movementscomplic/movementscomplic';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule, Lastarrival, Movementscomplic],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  link = 'http' + (isDevMode() ? '' : 's') + '://chiyanh.cluster031.hosting.ovh.net/';

  lg = 'fr';
  globalsearch = '';
  menuClicked = 'home';

  montreClicked: any;
  data: any;
  currentYear: any;
  montres: any = [];
  movements: any = [];

  indexImg = 0;
  image = 0;
  lastArrivalPage = 0;
  portraittreshold = 800;
  mobiletreshold = 550;
  lastScrollTop = 0;

  globalsearchvisible = false;
  mobilemenuvisible = false;
  showContent = true;
  paysage = false;
  mobile = false;
  isScrolled = false;
  forceSearch = false;

  @HostListener('window:resize')
  onResize() {
    this.checkDimensions();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Détection de la direction : true si on descend, false si on remonte
    const scrollingDown = scrollTop > this.lastScrollTop;

    // Mise à jour isScrolled pour > 80px
    this.isScrolled = scrollTop > 80;

    // Si on remonte et qu'on est entre 0 et 80px, scroll automatique à 0
    if (!scrollingDown && scrollTop > 0 && scrollTop < 80) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // protection iOS
  }

  constructor(private renderer: Renderer2, private http: HttpClient) {}

  async ngOnInit() {
    const saved = localStorage.getItem('theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    }

    this.currentYear = new Date().getFullYear();

    //const res = await fetch('data.json');
    //this.data = await res.json();

    this.getData();

    const resmontres = await fetch('montres.json');
    this.montres = await resmontres.json();

    const uniqueMovementsMap = new Map<string, { fr: string; en: string }>();

    this.montres.forEach((m: any) => {
      const fr = m.fr.movement;
      const en = m.en.movement;

      // utiliser la valeur française comme clé pour l'unicité
      if (!uniqueMovementsMap.has(fr)) {
        uniqueMovementsMap.set(fr, { fr, en });
      }
    });

    this.movements = Array.from(uniqueMovementsMap.values());

    let int = setInterval(() => {
      this.checkDimensions();
      clearInterval(int);
    }, 500);

    setInterval(() => {
      this.image++;
    }, 5000);
  }

  checkDimensions() {
    if (window.innerHeight > window.innerWidth && window.innerWidth < this.portraittreshold)
      this.paysage = false;
    else this.paysage = true;

    if (window.innerHeight > window.innerWidth && window.innerWidth < this.mobiletreshold)
      this.mobile = true;
    else this.mobile = false;
  }

  clickMobileMenu() {
    this.mobilemenuvisible = !this.mobilemenuvisible;
    if (this.mobile) return;
    if (!this.mobilemenuvisible) {
      this.renderer.setStyle(document.body, 'overflow-y', 'auto');
      this.renderer.setStyle(document.body, 'padding-right', '0px');
    } else {
      this.renderer.setStyle(document.body, 'overflow-y', 'hidden');
      this.renderer.setStyle(document.body, 'padding-right', '8px');
    }
  }

  getMenus() {
    return this.data.menus.filter((m: any) => !m.disabled);
  }

  onMontreClick(montre: any) {
    this.clickMenu('watch', montre);
  }

  isDevMode() {
    return isDevMode();
  }

  toggleDarkMode() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? '' : 'dark';

    if (newTheme) {
      html.setAttribute('data-theme', newTheme);
    } else {
      html.removeAttribute('data-theme');
    }

    localStorage.setItem('theme', newTheme);
  }

  clickMenu(menu: string, montre: any = undefined, search: boolean = false) {
    if (menu == this.menuClicked) return;
    this.forceSearch = search;
    if (montre != undefined) {
      this.montreClicked = montre;
      this.indexImg = 0;
    }
    this.mobilemenuvisible = false;
    if (!this.mobilemenuvisible) {
      this.renderer.setStyle(document.body, 'overflow-y', 'auto');
      this.renderer.setStyle(document.body, 'padding-right', '0px');
    } else {
      this.renderer.setStyle(document.body, 'overflow-y', 'hidden');
      this.renderer.setStyle(document.body, 'padding-right', '8px');
    }
    this.showContent = false;
    setTimeout(() => {
      this.menuClicked = menu;
      setTimeout(() => {
        this.showContent = true;
        const top = search ? Math.floor(window.innerHeight * 0.7) : 0;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }, 100);
    }, 500);
  }

  rechercherMontres() {
    const q = this.globalsearch.trim().toLowerCase();
    if (!q) return [];

    const resultats = this.montres
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
      .filter((m: any) => m.score > 0)
      .sort((a: any, b: any) => b.score - a.score);

    return resultats;
  }

  getFirstInfos() {
    return this.data.ordre.slice(0, 8);
  }
  getBotInfos() {
    return this.data.ordre.slice(8, 20);
  }

  async updateData() {
    const res = await fetch('data.json');
    this.data = await res.json();

    this.http
      .post<void>(this.link + 'sethorlogeraixois', this.data, {
        headers: { 'Content-Type': 'application/json' },
      })
      .subscribe((data: any) => {
        this.getData();
      });
  }

  getData() {
    this.http.get<any>(this.link + 'gethorlogeraixois').subscribe((data: any) => {
      this.data = data;
    });
  }
}
