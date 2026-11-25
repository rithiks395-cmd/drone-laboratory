export interface ExperimentInfo {
  id: number;
  title: string;
  shortTitle: string;
  category: 'Design & Weight' | 'Assembly' | 'Propulsion' | 'Avionics & Control' | 'Power Systems';
  description: string;
  aim: string;
  softwareRequired: string[];
  componentsUsed: string[];
  theory: string;
  procedure: string[];
  precautions: string[];
  completed: boolean;
  score?: number;
  lastSimulated?: string;
}

export interface LabRecordData {
  experimentId: number;
  studentName: string;
  rollNumber: string;
  date: string;
  observations: Record<string, string | number>;
  calculations: Record<string, string | number>;
  resultSummary: string;
  screenshotUrl?: string;
}

export type ActiveView = 
  | 'dashboard'
  | 'exp1'
  | 'exp2'
  | 'exp3'
  | 'exp4'
  | 'exp5'
  | 'exp6'
  | 'exp7'
  | 'exp8'
  | 'exp9'
  | 'exp10'
  | 'flight-simulator'
  | 'lab-records';
