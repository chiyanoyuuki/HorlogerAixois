import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Shop } from './shop/shop';
import { Contact } from './contact/contact';
import { About } from './about/about';
import { Horology } from './horology/horology';
import { Legal } from './legal/legal';
import { Watch } from './watch/watch';
import { Watches } from './watches/watches';
import { Workshop } from './workshop/workshop';
import { Addwatch } from './addwatch/addwatch';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'watch/:reference', component: Watch },
  { path: 'shop', component: Shop },
  { path: 'workshop', component: Workshop },
  { path: 'watches', component: Watches },
  { path: 'horology', component: Horology },
  { path: 'contact', component: Contact },
  { path: 'about', component: About },
  { path: 'legal', component: Legal },
  { path: 'addwatch', component: Addwatch },
  { path: '**', redirectTo: 'home' },
];
