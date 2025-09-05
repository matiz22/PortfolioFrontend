export interface SkillDto {
  id: number;
  name: string;
  icon: string;
  proficiency_id: number | null;
  created_at: string;
  updated_at: string;
  order: number;
  pivot: {
    realization_id: number;
    skill_id: number;
  };
}
