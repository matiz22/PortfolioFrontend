export interface Skill {
  id: number;
  name: string;
  icon: string;
  proficiencyId: number | null;
  createdAt: Date;
  updatedAt: Date;
  order: number;
  pivot: { realizationId: number; skillId: number };
}
