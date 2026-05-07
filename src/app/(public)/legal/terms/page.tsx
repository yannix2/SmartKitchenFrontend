"use client";

import { LegalShell, LegalSection } from "../_components";
import { useT } from "@/i18n/provider";

export default function TermsPage() {
  const t = useT({
    fr: {
      title: "Conditions Générales d'Utilisation",
      updated: "Dernière mise à jour : 27 avril 2026",
      s1_title: "1. Objet",
      s1_p: "Les présentes Conditions Générales d'Utilisation (« CGU ») régissent l'utilisation de la plateforme SmartKitchen accessible à l'adresse smartkitchen.com (la « Plateforme »). En créant un compte, vous acceptez l'intégralité de ces CGU.",
      s2_title: "2. Service fourni",
      s2_p: "SmartKitchen est un service automatisé de détection et de récupération de remboursements pour les restaurants utilisant Uber Eats. Le Service consiste à : (a) collecter les données de commandes via les rapports Uber Eats officiels, (b) identifier les commandes annulées et contestées éligibles à un remboursement, (c) générer et transmettre les demandes de remboursement à Uber. SmartKitchen ne reçoit ni ne stocke aucun fonds : Uber rembourse directement le compte du restaurant.",
      s3_title: "3. Inscription et compte",
      s3_p: "Pour accéder au Service, vous devez créer un compte avec des informations exactes et à jour. Vous êtes responsable de la confidentialité de vos identifiants. Toute activité sur votre compte est présumée effectuée par vous. Vous devez avoir au moins 18 ans et être autorisé à représenter le restaurant connecté.",
      s4_title: "4. Période d'essai et abonnement",
      s4_p: "Tout nouveau compte bénéficie d'une période d'essai gratuite de 3 jours. À l'issue de cet essai, le Service nécessite un abonnement payant mensuel pour continuer à fonctionner. L'abonnement est renouvelable automatiquement chaque mois et peut être résilié à tout moment depuis l'espace facturation. La résiliation prend effet à la fin de la période en cours déjà payée.",
      s5_title: "5. Commissions",
      s5_p: "En complément de l'abonnement, SmartKitchen perçoit une commission de 20 % sur les commandes contestées remboursées et de 15 % sur les commandes annulées remboursées. La commission n'est due que sur les montants effectivement récupérés. Aucune récupération = aucune commission.",
      s6_title: "6. Obligations de l'utilisateur",
      s6_p: "Vous vous engagez à : (a) ne fournir que des informations exactes lors de l'inscription et du KYC, (b) connecter uniquement des comptes Uber Eats dont vous êtes le titulaire ou pour lesquels vous avez l'autorisation, (c) ne pas tenter de contourner les mécanismes techniques de la Plateforme, (d) respecter les conditions d'utilisation d'Uber Eats.",
      s7_title: "7. Suspension et résiliation",
      s7_p: "SmartKitchen se réserve le droit de suspendre ou résilier tout compte en cas de violation des présentes CGU, de fraude avérée, ou de défaut de paiement. La résiliation pour non-paiement intervient après un préavis de 7 jours.",
      s8_title: "8. Limitation de responsabilité",
      s8_p: "SmartKitchen met en œuvre des moyens raisonnables pour récupérer les remboursements, mais ne garantit pas un taux de récupération spécifique. La décision finale appartient à Uber. SmartKitchen ne saurait être tenu responsable des décisions de refus de remboursement par Uber, ni des éventuelles modifications par Uber de ses politiques.",
      s9_title: "9. Modification des CGU",
      s9_p: "SmartKitchen peut modifier les présentes CGU à tout moment. Les utilisateurs sont informés par email au moins 30 jours avant l'entrée en vigueur des modifications. La poursuite de l'utilisation après cette période vaut acceptation.",
      s10_title: "10. Droit applicable",
      s10_p: "Les présentes CGU sont régies par le droit tunisien. Tout litige relatif à leur exécution sera soumis aux tribunaux compétents du siège social de SmartKitchen.",
    },
    en: {
      title: "Terms of Service",
      updated: "Last updated: April 27, 2026",
      s1_title: "1. Purpose",
      s1_p: "These Terms of Service (\"Terms\") govern your use of the SmartKitchen platform available at smartkitchen.com (the \"Platform\"). By creating an account, you agree to these Terms in full.",
      s2_title: "2. The Service",
      s2_p: "SmartKitchen is an automated refund detection and recovery service for restaurants using Uber Eats. The Service: (a) collects order data via official Uber Eats reports, (b) identifies cancelled and contested orders eligible for a refund, (c) generates and submits refund requests to Uber. SmartKitchen does not receive or hold any funds — Uber refunds the restaurant's account directly.",
      s3_title: "3. Account registration",
      s3_p: "To access the Service, you must create an account with accurate and up-to-date information. You are responsible for the confidentiality of your credentials. All activity on your account is presumed to be carried out by you. You must be at least 18 years old and authorized to represent the connected restaurant.",
      s4_title: "4. Trial period and subscription",
      s4_p: "New accounts receive a free 3-day trial period. After the trial, an active monthly subscription is required to continue using the Service. The subscription auto-renews monthly and can be cancelled anytime from the billing page. Cancellation takes effect at the end of the current paid period.",
      s5_title: "5. Commissions",
      s5_p: "In addition to the subscription, SmartKitchen charges a 20% commission on refunded contested orders and 15% on refunded cancelled orders. Commission is only charged on amounts actually recovered. No recovery = no commission.",
      s6_title: "6. User obligations",
      s6_p: "You agree to: (a) provide only accurate information during signup and KYC, (b) connect only Uber Eats accounts that you own or are authorized to manage, (c) not attempt to circumvent the Platform's technical safeguards, (d) comply with Uber Eats' own terms of service.",
      s7_title: "7. Suspension and termination",
      s7_p: "SmartKitchen reserves the right to suspend or terminate any account that violates these Terms, in cases of proven fraud, or for non-payment. Termination for non-payment occurs after a 7-day notice period.",
      s8_title: "8. Limitation of liability",
      s8_p: "SmartKitchen uses commercially reasonable efforts to recover refunds but does not guarantee any specific recovery rate. The final decision belongs to Uber. SmartKitchen is not liable for refund refusals by Uber, nor for any subsequent change to Uber's policies.",
      s9_title: "9. Changes to these Terms",
      s9_p: "SmartKitchen may modify these Terms at any time. Users will be notified by email at least 30 days before any change takes effect. Continued use of the Service after that period constitutes acceptance.",
      s10_title: "10. Governing law",
      s10_p: "These Terms are governed by Tunisian law. Any dispute arising from their execution will be submitted to the competent courts of SmartKitchen's registered office.",
    },
  });

  const sections = [
    { title: t.s1_title,  p: t.s1_p  }, { title: t.s2_title,  p: t.s2_p  },
    { title: t.s3_title,  p: t.s3_p  }, { title: t.s4_title,  p: t.s4_p  },
    { title: t.s5_title,  p: t.s5_p  }, { title: t.s6_title,  p: t.s6_p  },
    { title: t.s7_title,  p: t.s7_p  }, { title: t.s8_title,  p: t.s8_p  },
    { title: t.s9_title,  p: t.s9_p  }, { title: t.s10_title, p: t.s10_p },
  ];

  return (
    <LegalShell title={t.title} lastUpdated={t.updated}>
      {sections.map((s, i) => (
        <LegalSection key={i} title={s.title}><p>{s.p}</p></LegalSection>
      ))}
    </LegalShell>
  );
}
