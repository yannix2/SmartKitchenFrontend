"use client";

import { LegalShell, LegalSection } from "../_components";
import { useT } from "@/i18n/provider";

export default function MentionsPage() {
  const t = useT({
    fr: {
      title: "Mentions Légales",
      updated: "Dernière mise à jour : 27 avril 2026",

      s1_title: "Éditeur du site",
      s1_a: "Raison sociale : [TODO: à compléter — ex. SmartKitchen SARL]",
      s1_b: "Forme juridique : [TODO: SARL / SAS / personne physique]",
      s1_c: "Capital social : [TODO]",
      s1_d: "Siège social : [TODO: adresse complète]",
      s1_e: "Numéro RNE / Matricule fiscal : [TODO]",
      s1_f: "Numéro de TVA : [TODO si applicable]",
      s1_g: "Représentant légal : [TODO: nom du dirigeant]",
      s1_h: "Email de contact : support@smartkitchen.com",

      s2_title: "Hébergement",
      s2_a: "Frontend : Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.",
      s2_b: "Backend et base de données : [TODO: ex. Railway, Supabase EU, etc.]",
      s2_c: "Stockage des documents KYC : Supabase, hébergement Europe (Frankfurt).",

      s3_title: "Directeur de la publication",
      s3_p: "Le directeur de la publication est le représentant légal de SmartKitchen indiqué ci-dessus.",

      s4_title: "Propriété intellectuelle",
      s4_p: "L'ensemble du contenu du site smartkitchen.com (textes, graphismes, logos, code, marques) est la propriété exclusive de SmartKitchen. Toute reproduction, totale ou partielle, sans autorisation écrite préalable est interdite et constitue une contrefaçon sanctionnée par le code de la propriété intellectuelle.",

      s5_title: "Données personnelles",
      s5_p: "Le traitement des données personnelles est régi par notre Politique de Confidentialité, accessible depuis le pied de page. Pour exercer vos droits RGPD : privacy@smartkitchen.com.",

      s6_title: "Cookies",
      s6_p: "Le site utilise uniquement des cookies techniques essentiels (session, préférence de langue). Aucun cookie de tracking ou publicitaire n'est déposé.",

      s7_title: "Crédits",
      s7_p: "Conception, développement et hébergement : SmartKitchen. Icônes : Lucide. Police : système.",
    },
    en: {
      title: "Legal Notice",
      updated: "Last updated: April 27, 2026",

      s1_title: "Site publisher",
      s1_a: "Legal entity name: [TODO: e.g. SmartKitchen SARL]",
      s1_b: "Legal form: [TODO: SARL / SAS / sole proprietorship]",
      s1_c: "Share capital: [TODO]",
      s1_d: "Registered office: [TODO: full address]",
      s1_e: "RNE / Tax ID: [TODO]",
      s1_f: "VAT number: [TODO if applicable]",
      s1_g: "Legal representative: [TODO: name]",
      s1_h: "Contact email: support@smartkitchen.com",

      s2_title: "Hosting",
      s2_a: "Frontend: Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA.",
      s2_b: "Backend and database: [TODO: e.g. Railway, Supabase EU, etc.]",
      s2_c: "KYC document storage: Supabase, hosted in Europe (Frankfurt).",

      s3_title: "Publication director",
      s3_p: "The publication director is the legal representative of SmartKitchen named above.",

      s4_title: "Intellectual property",
      s4_p: "All content on smartkitchen.com (text, graphics, logos, code, trademarks) is the exclusive property of SmartKitchen. Any total or partial reproduction without prior written authorization is forbidden and constitutes counterfeiting punishable by intellectual property law.",

      s5_title: "Personal data",
      s5_p: "Personal data processing is governed by our Privacy Policy, available from the footer. To exercise your GDPR rights: privacy@smartkitchen.com.",

      s6_title: "Cookies",
      s6_p: "The site uses only essential technical cookies (session, language preference). No tracking or advertising cookies are dropped.",

      s7_title: "Credits",
      s7_p: "Design, development and hosting: SmartKitchen. Icons: Lucide. Font: system.",
    },
  });

  return (
    <LegalShell title={t.title} lastUpdated={t.updated}>
      <LegalSection title={t.s1_title}>
        <ul className="list-none space-y-1">
          <li>{t.s1_a}</li><li>{t.s1_b}</li><li>{t.s1_c}</li><li>{t.s1_d}</li>
          <li>{t.s1_e}</li><li>{t.s1_f}</li><li>{t.s1_g}</li><li>{t.s1_h}</li>
        </ul>
      </LegalSection>
      <LegalSection title={t.s2_title}>
        <ul className="list-none space-y-1">
          <li>{t.s2_a}</li><li>{t.s2_b}</li><li>{t.s2_c}</li>
        </ul>
      </LegalSection>
      <LegalSection title={t.s3_title}><p>{t.s3_p}</p></LegalSection>
      <LegalSection title={t.s4_title}><p>{t.s4_p}</p></LegalSection>
      <LegalSection title={t.s5_title}><p>{t.s5_p}</p></LegalSection>
      <LegalSection title={t.s6_title}><p>{t.s6_p}</p></LegalSection>
      <LegalSection title={t.s7_title}><p>{t.s7_p}</p></LegalSection>
    </LegalShell>
  );
}
