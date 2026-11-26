import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { ExperimentInfo, ActiveView, LabRecordData } from '../types/experiments';
import { EXPERIMENTS_LIST } from '../utils/experimentsData';
import { useAuth } from './AuthContext';
import html2canvas from 'html2canvas';

interface LabContextType {
  experiments: ExperimentInfo[];
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  markCompleted: (experimentId: number, score?: number) => void;
  resetExperiment: (experimentId: number) => void;
  resetAllProgress: () => void;
  labRecords: Record<number, LabRecordData>;
  saveLabRecord: (data: LabRecordData) => void;
  captureScreenshot: (elementRef: HTMLElement | null, experimentId?: number) => Promise<string | null>;
  capturedImage: string | null;
  setCapturedImage: (img: string | null) => void;
  isRecordModalOpen: boolean;
  setIsRecordModalOpen: (open: boolean) => void;
  selectedReportExpId: number;
  setSelectedReportExpId: (id: number) => void;
  studentName: string;
  setStudentName: (name: string) => void;
  rollNumber: string;
  setRollNumber: (roll: string) => void;
  inspectedComponent: string | null;
  openInspection: (name: string) => void;
  closeInspection: () => void;

  // New Daytime Atmosphere & Mobile Simulation Features
  atmosphereTheme: 'night' | 'day';
  toggleAtmosphereTheme: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  graphicsQuality: 'high' | 'low';
  toggleGraphicsQuality: () => void;

  // Phone Joystick Remote Pairing Modal
  isPhoneModalOpen: boolean;
  setIsPhoneModalOpen: (open: boolean) => void;
}

const LabContext = createContext<LabContextType | undefined>(undefined);

const STORAGE_KEY_EXPERIMENTS = 'uav_virtuallab_experiments';
const STORAGE_KEY_RECORDS = 'uav_virtuallab_records';
const STORAGE_KEY_STUDENT = 'uav_virtuallab_student';
const STORAGE_KEY_THEME = 'uav_virtuallab_theme';

export const LabProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // Storage keys strictly scoped per individual account
  const getUserScopeKey = (base: string) => {
    if (!currentUser) return `${base}_guest`;
    const clean = currentUser.id ? currentUser.id.toLowerCase() : currentUser.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${base}_user_${clean}`;
  };

  const currentExpKey = useMemo(() => getUserScopeKey(STORAGE_KEY_EXPERIMENTS), [currentUser?.id, currentUser?.email]);
  const currentRecordsKey = useMemo(() => getUserScopeKey(STORAGE_KEY_RECORDS), [currentUser?.id, currentUser?.email]);

  const [experiments, setExperiments] = useState<ExperimentInfo[]>(EXPERIMENTS_LIST);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [labRecords, setLabRecords] = useState<Record<number, LabRecordData>>({});
  const [studentName, setStudentName] = useState<string>('Aerospace Student');
  const [rollNumber, setRollNumber] = useState<string>('UAV-2026-001');

  // Load account-specific progress and records whenever the logged-in user changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(currentExpKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setExperiments(
          EXPERIMENTS_LIST.map((exp) => {
            const found = parsed.find((p: any) => p.id === exp.id);
            return found
              ? { ...exp, completed: found.completed, score: found.score, lastSimulated: found.lastSimulated }
              : exp;
          })
        );
      } else {
        setExperiments(EXPERIMENTS_LIST);
      }
    } catch (e) {
      setExperiments(EXPERIMENTS_LIST);
    }

    try {
      const savedRec = localStorage.getItem(currentRecordsKey);
      if (savedRec) {
        setLabRecords(JSON.parse(savedRec));
      } else {
        setLabRecords({});
      }
    } catch (e) {
      setLabRecords({});
    }

    if (currentUser?.name) {
      setStudentName(currentUser.name);
    }
    if (currentUser?.rollNumber) {
      setRollNumber(currentUser.rollNumber);
    }
  }, [currentExpKey, currentRecordsKey, currentUser]);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [selectedReportExpId, setSelectedReportExpId] = useState<number>(1);
  const [inspectedComponent, setInspectedComponent] = useState<string | null>(null);

  // Atmosphere Theme: 'day' for bright daylight airfield atmosphere, 'night' for dark aerospace HUD
  const [atmosphereTheme, setAtmosphereTheme] = useState<'night' | 'day'>(() => {
    return (localStorage.getItem(STORAGE_KEY_THEME) as 'night' | 'day') || 'day'; // Default to Day as requested!
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [graphicsQuality, setGraphicsQuality] = useState<'high' | 'low'>('high');
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(currentExpKey, JSON.stringify(experiments));
  }, [experiments, currentExpKey]);

  useEffect(() => {
    localStorage.setItem(currentRecordsKey, JSON.stringify(labRecords));
  }, [labRecords, currentRecordsKey]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_STUDENT}_name`, studentName);
    localStorage.setItem(`${STORAGE_KEY_STUDENT}_roll`, rollNumber);
  }, [studentName, rollNumber]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, atmosphereTheme);
  }, [atmosphereTheme]);

  const toggleAtmosphereTheme = () => {
    setAtmosphereTheme((prev) => (prev === 'night' ? 'day' : 'night'));
  };

  const toggleGraphicsQuality = () => {
    setGraphicsQuality((prev) => (prev === 'high' ? 'low' : 'high'));
  };

  const markCompleted = (experimentId: number, score = 100) => {
    setExperiments((prev) =>
      prev.map((exp) =>
        exp.id === experimentId
          ? { ...exp, completed: true, score, lastSimulated: new Date().toLocaleString() }
          : exp
      )
    );
  };

  const resetExperiment = (experimentId: number) => {
    setExperiments((prev) =>
      prev.map((exp) =>
        exp.id === experimentId
          ? { ...exp, completed: false, score: undefined, lastSimulated: undefined }
          : exp
      )
    );
  };

  const resetAllProgress = () => {
    if (window.confirm('Reset all virtual laboratory progress and records for this account?')) {
      setExperiments(EXPERIMENTS_LIST);
      setLabRecords({});
      localStorage.removeItem(currentExpKey);
      localStorage.removeItem(currentRecordsKey);
    }
  };

  const saveLabRecord = (data: LabRecordData) => {
    setLabRecords((prev) => ({ ...prev, [data.experimentId]: data }));
    markCompleted(data.experimentId);
  };

  const captureScreenshot = async (elementRef: HTMLElement | null, experimentId?: number): Promise<string | null> => {
    if (!elementRef) {
      alert('Simulation workspace element not found to capture screenshot.');
      return null;
    }
    try {
      const canvas = await html2canvas(elementRef, {
        backgroundColor: atmosphereTheme === 'day' ? '#1e293b' : '#0a0f1d',
        useCORS: true,
        scale: 1.5,
        logging: false,
      });
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedImage(dataUrl);

      if (experimentId) {
        setLabRecords((prev) => {
          const current = prev[experimentId] || {
            experimentId,
            studentName,
            rollNumber,
            date: new Date().toLocaleDateString(),
            observations: {},
            calculations: {},
            resultSummary: 'Experiment simulation workspace output captured successfully.',
          };
          return {
            ...prev,
            [experimentId]: { ...current, screenshotUrl: dataUrl },
          };
        });
      }
      return dataUrl;
    } catch (err) {
      console.error('Screenshot capture failed', err);
      alert('Failed to capture screenshot. Ensure WebGL canvas allows cross-origin buffer reading.');
      return null;
    }
  };

  const openInspection = (name: string) => {
    setInspectedComponent(name);
  };

  const closeInspection = () => {
    setInspectedComponent(null);
  };

  return (
    <LabContext.Provider
      value={{
        experiments,
        activeView,
        setActiveView,
        markCompleted,
        resetExperiment,
        resetAllProgress,
        labRecords,
        saveLabRecord,
        captureScreenshot,
        capturedImage,
        setCapturedImage,
        isRecordModalOpen,
        setIsRecordModalOpen,
        selectedReportExpId,
        setSelectedReportExpId,
        studentName,
        setStudentName,
        rollNumber,
        setRollNumber,
        inspectedComponent,
        openInspection,
        closeInspection,
        atmosphereTheme,
        toggleAtmosphereTheme,
        mobileMenuOpen,
        setMobileMenuOpen,
        graphicsQuality,
        toggleGraphicsQuality,
        isPhoneModalOpen,
        setIsPhoneModalOpen,
      }}
    >
      {children}
    </LabContext.Provider>
  );
};

export const useLab = () => {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error('useLab must be used within a LabProvider');
  }
  return context;
};
