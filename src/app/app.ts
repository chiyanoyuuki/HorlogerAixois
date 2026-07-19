import { Component, HostListener, isDevMode, OnInit, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Service } from './service';
import { Admin } from './admin/admin.service';
import { AdminPanel } from './admin/admin-panel/admin-panel';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule, RouterOutlet, AdminPanel],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  link = 'http' + (isDevMode() ? '' : 's') + '://chiyanh.cluster031.hosting.ovh.net/';

  globalsearch = '';
  menuClicked = 'home';

  montreClicked: any;
  currentYear: any;

  lastArrivalPage = 0;
  portraittreshold = 800;
  mobiletreshold = 550;
  lastScrollTop = 0;

  globalsearchvisible = false;
  paysage = false;
  isScrolled = false;
  forceSearch = false;

  @HostListener('window:resize')
  onResize() {
    this.checkDimensions();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.isScrolled = scrollTop > 8;
    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // protection iOS
  }

  constructor(
    private renderer: Renderer2,
    private http: HttpClient,
    public app: Service,
    public admin: Admin,
  ) {}

  async ngOnInit() {
    const saved = localStorage.getItem('theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    }

    this.currentYear = new Date().getFullYear();

    //const res = await fetch('data.json');
    //this.app.data = await res.json();

    this.getData();

    this.app.getWatches();

    this.checkDimensions();
    let int = setInterval(() => {
      this.checkDimensions();
      clearInterval(int);
    }, 500);
  }

  clickMenu(menu: string, montre: any = undefined, search: boolean = false) {
    this.app.clickMenu(menu, montre, search);
    if (!this.app.mobilemenuvisible) {
      this.renderer.setStyle(document.body, 'overflow-y', 'auto');
      this.renderer.setStyle(document.body, 'padding-right', '0px');
    } else {
      this.renderer.setStyle(document.body, 'overflow-y', 'hidden');
      this.renderer.setStyle(document.body, 'padding-right', '8px');
    }
  }

  checkDimensions() {
    if (window.innerHeight > window.innerWidth && window.innerWidth < this.portraittreshold)
      this.paysage = false;
    else this.paysage = true;

    if (window.innerHeight > window.innerWidth && window.innerWidth < this.mobiletreshold)
      this.app.mobile = true;
    else this.app.mobile = false;
  }

  clickMobileMenu() {
    this.app.mobilemenuvisible = !this.app.mobilemenuvisible;
    if (this.app.mobile) return;
    if (!this.app.mobilemenuvisible) {
      this.renderer.setStyle(document.body, 'overflow-y', 'auto');
      this.renderer.setStyle(document.body, 'padding-right', '0px');
    } else {
      this.renderer.setStyle(document.body, 'overflow-y', 'hidden');
      this.renderer.setStyle(document.body, 'padding-right', '8px');
    }
  }

  getMenus() {
    return this.app.data.menus.filter((m: any) => !m.disabled);
  }

  onMontreClick(montre: any) {
    console.log('ok', montre);
    this.app.clickMenu('watch', montre);
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

  rechercherMontres() {
    const q = this.globalsearch.trim().toLowerCase();
    if (!q) return [];

    const resultats = this.app.montres
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

  getData() {
    this.http.get<any>(this.link + 'gethorlogeraixois').subscribe((data: any) => {
      this.app.data = data;
    });
  }
}
