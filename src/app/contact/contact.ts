import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Service } from '../service';

@Component({
  selector: 'app-contact',
  imports: [FormsModule, CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  /** ⚠️ À PERSONNALISER : adresse de réception des messages de contact. */
  readonly CONTACT_EMAIL = 'contact@horlogeraixois.fr';

  sent = false;

  constructor(public app: Service) {}

  /**
   * Compose un e-mail à partir des champs du formulaire et ouvre le logiciel
   * de messagerie du visiteur (mailto). Aucune dépendance serveur.
   */
  sendMessage() {
    const fields: any[] = this.app.data?.contact ?? [];
    const lg = this.app.lg;
    const lines = fields
      .filter((f) => f.type !== 'textarea')
      .map((f) => `${f[lg]} : ${f.model || ''}`);
    const message = fields.find((f) => f.type === 'textarea');
    const body = lines.join('\n') + (message ? `\n\n${message.model || ''}` : '');
    const subject =
      lg === 'fr' ? 'Demande de contact — HorlogerAixois' : 'Contact request — HorlogerAixois';
    window.location.href = `mailto:${this.CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    this.sent = true;
  }
}
