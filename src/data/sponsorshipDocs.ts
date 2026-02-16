export interface SponsorshipDocument {
  id: string;
  title: string;
  description: string;
  pdfUrl: string;
  fileName: string;
  lang: string;
}

export const sponsorshipDocuments: SponsorshipDocument[] = [
  {
    id: 'sponsor-form-tr',
    title: 'Sponsorluk Bilgilendirme Formu',
    description: 'Turkce sponsorluk basvuru formu ve detayli bilgiler.',
    pdfUrl: 'https://ab02c78b-36a7-4cce-8b03-5f3cd38bce82.usrfiles.com/ugd/ab02c7_44264d89dd7d42b3878832267e3bfdea.pdf',
    fileName: 'sponsorluk-bilgilendirme-formu-tr.pdf',
    lang: 'TR',
  },
  {
    id: 'sponsor-form-en',
    title: 'Sponsorship Information Form',
    description: 'English sponsorship application form and detailed information.',
    pdfUrl: 'https://ab02c78b-36a7-4cce-8b03-5f3cd38bce82.usrfiles.com/ugd/ab02c7_33315a59efcd43e8b493392e948709cc.pdf',
    fileName: 'sponsorship-information-form-en.pdf',
    lang: 'EN',
  },
];
