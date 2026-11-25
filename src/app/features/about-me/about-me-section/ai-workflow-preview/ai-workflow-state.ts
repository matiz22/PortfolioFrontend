export const WORKFLOW_SCENES = ['team', 'knowledge', 'operations'] as const;
export type WorkflowScene = typeof WORKFLOW_SCENES[number];
export type WorkflowPhase = 'idle' | 'request' | 'thinking' | 'delegating' | 'tools' |
  'analyst-done' | 'collecting' | 'drafting' | 'complete' |
  'question' | 'retrieving' | 'reading' | 'answering' |
  'monitoring' | 'incident' | 'investigating' | 'repairing' | 'verifying' | 'restored';
