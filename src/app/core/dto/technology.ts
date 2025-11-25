export interface TechnologyDto {
  id: number;
  name: string;
  icon: string | null;
  proficiency_id: number | null;
  created_at: string;
  updated_at: string;
  order: number;
  pivot: {
    project_id: number;
    technology_id: number;
  };
}
