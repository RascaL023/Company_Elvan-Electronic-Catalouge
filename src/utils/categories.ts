const categoryNames: Record<string, string> = {
  refrigerator: 'Kulkas',
  television: 'Televisi',
  smartphone: 'Smartphone',
  washing_machine: 'Mesin Cuci',
  sewing_machine: 'Mesin Jahit',
};

export function getCategoryName(slug: string): string {
  return categoryNames[slug] || slug;
}
