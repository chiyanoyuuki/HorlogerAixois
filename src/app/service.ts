import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
@Injectable({ providedIn: 'root' })
export class Service {
  data: any;
  lg = 'fr';
  montres: any = [];
  mobile = false;
  montreClicked: any;
  showContent = true;
  menuClicked: any = 'home';
  mobilemenuvisible = false;
  link = 'http' + (isDevMode() ? '' : 's') + '://chiyanh.cluster031.hosting.ovh.net/';

  constructor(
    private router: Router,
    private http: HttpClient,
  ) {}

  clickMenu(menu: string, montre: any = undefined, search: boolean = false) {
    this.montreClicked = undefined;
    if (menu != 'watch' && menu == this.menuClicked) return;
    if (montre != undefined) {
      this.montreClicked = montre;
    }
    console.log(this.montreClicked);
    this.mobilemenuvisible = false;
    this.showContent = false;
    setTimeout(() => {
      this.menuClicked = menu;
      if (!this.montreClicked) this.router.navigate([menu]);
      else {
        console.log(this.montreClicked.otherData.reference);
        this.router.navigate(['watch', this.montreClicked.otherData.reference]);
      }
      setTimeout(() => {
        this.showContent = true;
        const top = search ? Math.floor(window.innerHeight * 0.7) : 0;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }, 100);
    }, 500);
  }

  getWatches(): void {
    this.http.get<any[]>(this.link + 'montreshorloger.php').subscribe({
      next: (watches) => {
        this.montres = watches; // toutes les montres en mémoire
        console.log(this.montres);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des montres :', err);
      },
    });
  }

  loadMontreById(id: string) {
    return this.montres.find((m: any) => m.id == id);
  }
}
