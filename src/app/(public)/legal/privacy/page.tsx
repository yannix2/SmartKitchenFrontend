"use client";

import { LegalShell, LegalSection } from "../_components";
import { useT } from "@/i18n/provider";

export default function PrivacyPage() {
  const t = useT({
    fr: {
      title: "Politique de Confidentialité",
      updated: "Dernière mise à jour : 27 avril 2026",

      s1_title: "1. Responsable du traitement",
      s1_p: "Le responsable du traitement des données personnelles est la société SmartKitchen, dont les coordonnées figurent dans les Mentions Légales. Pour toute question relative à la protection de vos données, contactez-nous à privacy@smartkitchen.com.",

      s2_title: "2. Données collectées",
      s2_p_a: "Données d'identification : nom, prénom, email, numéro de téléphone, adresse postale.",
      s2_p_b: "Données KYC : numéro CIN ou passeport, date de naissance, nationalité, document d'identité, justificatif d'activité (patente, RNE, extrait commercial).",
      s2_p_c: "Données professionnelles : raison sociale, numéro fiscal, RNE, type de société, années d'activité.",
      s2_p_d: "Données opérationnelles : identifiants Uber Eats (UUID des stores), historique des commandes annulées et contestées, montants des remboursements.",
      s2_p_e: "Données techniques : adresse IP, type de navigateur, journaux d'accès, cookies de session.",

      s3_title: "3. Finalités du traitement",
      s3_p: "Vos données sont traitées pour : (a) créer et gérer votre compte, (b) vérifier votre identité (obligation légale anti-fraude), (c) générer et transmettre les demandes de remboursement à Uber, (d) facturer l'abonnement et les commissions, (e) vous fournir le support et les mises à jour produit, (f) respecter nos obligations légales et fiscales.",

      s4_title: "4. Base légale",
      s4_p: "Le traitement repose sur : l'exécution du contrat (Article 6.1.b RGPD) pour la prestation du Service ; l'obligation légale (Article 6.1.c) pour le KYC et la facturation ; votre consentement (Article 6.1.a) pour les communications marketing optionnelles.",

      s5_title: "5. Durée de conservation",
      s5_p: "Données du compte : pendant toute la durée de l'abonnement, puis 3 ans après la résiliation à des fins commerciales et légales. Documents KYC : 5 ans après la fin de la relation contractuelle (obligation anti-blanchiment). Factures : 10 ans (obligation comptable).",

      s6_title: "6. Sous-traitants et destinataires",
      s6_p: "Nous partageons certaines données avec des sous-traitants strictement nécessaires : Stripe (paiements), Mailjet (emails transactionnels), Supabase (stockage des documents KYC, hébergement EU), Twilio (appels et SMS du CRM). Aucune donnée n'est revendue ni partagée à des fins publicitaires.",

      s7_title: "7. Transferts hors UE",
      s7_p: "Vos données sont stockées principalement en Europe (Supabase EU). Certains sous-traitants (Stripe, Twilio) peuvent traiter des données aux États-Unis sous le cadre des Clauses Contractuelles Types de la Commission Européenne.",

      s8_title: "8. Vos droits",
      s8_p: "Conformément au RGPD, vous disposez des droits d'accès, de rectification, d'effacement, de limitation, d'opposition, et de portabilité de vos données. Vous pouvez les exercer en écrivant à privacy@smartkitchen.com. Vous avez également le droit d'introduire une réclamation auprès de l'INPDP (Tunisie) ou de la CNIL (France).",

      s9_title: "9. Cookies",
      s9_p: "SmartKitchen utilise uniquement des cookies techniques essentiels au fonctionnement de la Plateforme (session, préférence de langue). Aucun cookie de tracking publicitaire n'est utilisé.",

      s10_title: "10. Sécurité",
      s10_p: "Toutes les données sont chiffrées en transit (TLS) et au repos. Les documents KYC sont stockés avec des contrôles d'accès stricts. Les mots de passe sont hachés avec bcrypt. Nous n'avons jamais accès en clair à vos identifiants Uber Eats.",
    },
    en: {
      title: "Privacy Policy",
      updated: "Last updated: April 27, 2026",

      s1_title: "1. Data controller",
      s1_p: "The data controller is SmartKitchen — full contact details are listed in the Legal Notice. For any question regarding the protection of your data, write to privacy@smartkitchen.com.",

      s2_title: "2. Data we collect",
      s2_p_a: "Identification data: first and last name, email, phone number, postal address.",
      s2_p_b: "KYC data: CIN or passport number, date of birth, nationality, ID document, proof of business ownership (patente, RNE, commercial register extract).",
      s2_p_c: "Business data: legal entity name, tax ID, RNE, business type, years in business.",
      s2_p_d: "Operational data: Uber Eats store IDs, history of cancelled and contested orders, refund amounts.",
      s2_p_e: "Technical data: IP address, browser type, access logs, session cookies.",

      s3_title: "3. Purposes",
      s3_p: "We process your data to: (a) create and manage your account, (b) verify your identity (legal anti-fraud requirement), (c) generate and submit refund requests to Uber, (d) bill subscriptions and commissions, (e) provide support and product updates, (f) comply with our legal and tax obligations.",

      s4_title: "4. Legal basis",
      s4_p: "Processing is based on: contract performance (GDPR Article 6.1.b) for delivering the Service; legal obligation (Article 6.1.c) for KYC and billing; your consent (Article 6.1.a) for optional marketing communications.",

      s5_title: "5. Retention period",
      s5_p: "Account data: for the duration of your subscription, then 3 years after termination for commercial and legal purposes. KYC documents: 5 years after the end of the contractual relationship (anti-money-laundering obligation). Invoices: 10 years (accounting obligation).",

      s6_title: "6. Processors and recipients",
      s6_p: "We share some data with processors strictly necessary for the Service: Stripe (payments), Mailjet (transactional emails), Supabase (KYC document storage, EU hosting), Twilio (CRM calls and SMS). Data is never resold or shared for advertising.",

      s7_title: "7. Transfers outside the EU",
      s7_p: "Your data is primarily stored in Europe (Supabase EU). Some processors (Stripe, Twilio) may process data in the United States under the European Commission's Standard Contractual Clauses.",

      s8_title: "8. Your rights",
      s8_p: "Under GDPR, you have the right to access, rectify, erase, restrict, object to, and port your data. Exercise them by writing to privacy@smartkitchen.com. You also have the right to lodge a complaint with the INPDP (Tunisia) or CNIL (France).",

      s9_title: "9. Cookies",
      s9_p: "SmartKitchen uses only technical cookies essential to the Platform's operation (session, language preference). No advertising tracking cookies are used.",

      s10_title: "10. Security",
      s10_p: "All data is encrypted in transit (TLS) and at rest. KYC documents are stored with strict access controls. Passwords are hashed with bcrypt. We never have clear-text access to your Uber Eats credentials.",
    },
  });

  return (
    <LegalShell title={t.title} lastUpdated={t.updated}>
      <LegalSection title={t.s1_title}><p>{t.s1_p}</p></LegalSection>
      <LegalSection title={t.s2_title}>
        <ul className="list-disc list-inside space-y-1.5">
          <li>{t.s2_p_a}</li><li>{t.s2_p_b}</li><li>{t.s2_p_c}</li>
          <li>{t.s2_p_d}</li><li>{t.s2_p_e}</li>
        </ul>
      </LegalSection>
      <LegalSection title={t.s3_title}><p>{t.s3_p}</p></LegalSection>
      <LegalSection title={t.s4_title}><p>{t.s4_p}</p></LegalSection>
      <LegalSection title={t.s5_title}><p>{t.s5_p}</p></LegalSection>
      <LegalSection title={t.s6_title}><p>{t.s6_p}</p></LegalSection>
      <LegalSection title={t.s7_title}><p>{t.s7_p}</p></LegalSection>
      <LegalSection title={t.s8_title}><p>{t.s8_p}</p></LegalSection>
      <LegalSection title={t.s9_title}><p>{t.s9_p}</p></LegalSection>
      <LegalSection title={t.s10_title}><p>{t.s10_p}</p></LegalSection>
    </LegalShell>
  );
}
