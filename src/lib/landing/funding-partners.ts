export type LabeledPartner = {
  id: string;
  label: string;
  name: string;
  logoSrc: string;
  href?: string;
};

/** Partners shown on the Access to Finance initiative page. */
export const accessToFinanceLabeledPartners: LabeledPartner[] = [
  {
    id: "afrigrow",
    label: "Powered by",
    name: "AfriGrow Hub",
    logoSrc: "/partners/afrigrow.png",
    href: "/",
  },
  {
    id: "yaf",
    label: "Community partner",
    name: "Yoruba Awareness Foundation",
    logoSrc: "/partners/yaf.png",
    href: "/partners",
  },
  {
    id: "loadofs",
    label: "Education partner",
    name: "Loadofs",
    logoSrc: "/partners/loadofs.png",
    href: "/partners",
  },
  {
    id: "funability",
    label: "Programme partner",
    name: "Funability Project",
    logoSrc: "/partners/funability.png",
    href: "/partners",
  },
];
