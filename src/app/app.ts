import { Component, ElementRef, HostListener, isDevMode, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
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
  styleUrl: './app.scss'
})
export class App implements OnInit 
{
  link = "http"+(isDevMode()?'':'s')+"://chiyanh.cluster031.hosting.ovh.net/";

  lg = "fr";
  globalsearch = "";
  menuClicked = "workshop";

  montreClicked:any;
  data:any;
  currentYear:any;
  montres:any=[];
  movements:any=[];

  indexImg = 0;
  image = 0;
  lastArrivalPage = 0;
  portraittreshold = 800;
  mobiletreshold = 550;

  globalsearchvisible = false;
  mobilemenuvisible = false;
  showContent = true;
  paysage = false;
  mobile = false;
  isScrolled = false;

  @HostListener('window:resize')
  onResize() {
      this.checkDimensions();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.pageYOffset > 80;
  }

  constructor(private renderer: Renderer2, private http: HttpClient) {}

  async ngOnInit() {
    this.currentYear = new Date().getFullYear();

    //const res = await fetch('data.json');
    //this.data = await res.json();

    this.getData();

    const resmontres = await fetch('montres.json');
    this.montres = await resmontres.json();

    const uniqueMovementsMap = new Map<string, {fr: string, en: string}>();

    this.montres.forEach((m:any) => {
      const fr = m.fr.movement;
      const en = m.en.movement;

      // utiliser la valeur française comme clé pour l'unicité
      if (!uniqueMovementsMap.has(fr)) {
        uniqueMovementsMap.set(fr, { fr, en });
      }
    });

    this.movements = Array.from(uniqueMovementsMap.values());
    console.log(this.movements);

    let int = setInterval(() => {
      this.checkDimensions();
      clearInterval(int);
    }, 500);

    setInterval(() => {
      this.image++;
    }, 5000);

  }

  checkDimensions(){
    if (
      window.innerHeight >window.innerWidth &&
      window.innerWidth < this.portraittreshold
    )
      this.paysage = false;
    else this.paysage = true;

    if (
      window.innerHeight >window.innerWidth &&
      window.innerWidth < this.mobiletreshold
    )
      this.mobile = true;
    else this.mobile = false;
  }

  clickMobileMenu(){
    this.mobilemenuvisible=!this.mobilemenuvisible;
    if (!this.mobilemenuvisible) {
      this.renderer.setStyle(document.body, 'overflow-y', 'auto');
      this.renderer.setStyle(document.body, 'padding-right', '0px');
    } else {
      this.renderer.setStyle(document.body, 'overflow-y', 'hidden');
      this.renderer.setStyle(document.body, 'padding-right', '8px');
    }
  }

  getMenus()
  {
    return this.data.menus.filter((m:any)=>!m.disabled);
  }

  onMontreClick(montre: any) {this.clickMenu("watch",montre);}

  clickMenu(menu:string, montre:any=undefined)
  {
    if(montre!=undefined)
    {
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
    let int = setInterval(() => {
      this.menuClicked = menu;
      let int2 = setInterval(() => {
        this.showContent = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        clearInterval(int2);
      },100);
      clearInterval(int);
    }, 500);
  }

  getFirstInfos(){return this.data.ordre.slice(0,8);}
  getBotInfos(){return this.data.ordre.slice(8,20);}

  async updateData(){
    const res = await fetch('data.json');
    this.data = await res.json();

    this.http
      .post<void>(this.link+'sethorlogeraixois', this.data, {
        headers: { 'Content-Type': 'application/json' }
      }).subscribe((data:any)=>{
        this.getData();
      });
  }

  getData(){
    this.http.get<any>(this.link + 'gethorlogeraixois').subscribe((data:any)=>{
      this.data = data;
      console.log(this.data);
    });
  }
}
