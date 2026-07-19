/**
 * Dictionnaire de libellés « humains » pour l'éditeur d'administration.
 * Permet d'afficher des noms clairs en français au client, plutôt que les
 * clés techniques du JSON. Toute clé absente retombe sur un formatage
 * automatique lisible.
 */
export const LABELS: Record<string, string> = {
  // Sections principales
  home: 'Accueil',
  shop: 'Magasin',
  workshop: 'Atelier',
  horology: 'Horlogerie',
  about: 'À propos',
  contact: 'Contact',
  menus: 'Navigation',
  blocs: 'Images des blocs',
  ordre: 'Champs des fiches montre',
  fr: 'Français',
  en: 'Anglais',

  // Champs récurrents
  title: 'Titre',
  text: 'Texte',
  textes: 'Paragraphes',
  texte: 'Paragraphe',
  bigimg: 'Image principale',
  images: 'Images',
  img: 'Images',
  outils: 'Outils',
  nom: 'Nom (dossier)',
  polissage: 'Polissage',
  movements: 'Mouvements',
  complications: 'Complications',
  revisions: 'Révisions',
  polishing: 'Polissage',
  piles: 'Piles',
  bracelets: 'Bracelets',
  placeholder: 'Texte indicatif',
  model: 'Valeur saisie',
  type: 'Type',
  id: 'Identifiant',
  disabled: 'Masqué',

  // Textes d'interface
  lastarrival: 'Dernières arrivées',
  rightsreserved: 'Mention « droits réservés »',
  legalmentions: 'Lien mentions légales',
  discover_horology: "Titre — L'horlogerie",
  horology_movements: 'Intro mouvements',
  similar: 'Modèles similaires',
  watches: 'Nos montres',
  tri: 'Tri',
  filtre: 'Filtre',
  delete_filters: 'Supprimer les filtres',
  reinit_filters: 'Réinitialiser les filtres',
  search: 'Recherche',
  revisions_txt: 'Texte révisions',
  polishing_txt: 'Texte polissage',
  piles_txt: 'Texte piles',
  bracelets_txt: 'Texte bracelets',
};

export function humanize(key: string): string {
  if (LABELS[key]) return LABELS[key];
  // clé inconnue -> transformation lisible : camelCase / snake_case -> mots
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^\w/, (c) => c.toUpperCase());
}
