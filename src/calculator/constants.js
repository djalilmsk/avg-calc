export const DEFAULT_EXAM_WEIGHT = 0.6;
export const DEFAULT_CA_WEIGHT = 0.4;

export const STORAGE_KEY = "semester_avg_app_v1";
export const HISTORY_LIMIT = 80;
export const SNAPSHOT_LIMIT = 30;
export const SNAPSHOT_VISIBLE_LIMIT = 6;

export const DEFAULT_ROWS = [
  {
    name: "Algorithmique et Complexite avancees",
    coef: 4,
    exam: "",
    ca: "",
    examWeight: DEFAULT_EXAM_WEIGHT,
    caWeight: DEFAULT_CA_WEIGHT,
    includeExam: true,
    includeCa: true,
  },
  {
    name: "BDD: Administration et architecture",
    coef: 4,
    exam: "",
    ca: "",
    examWeight: DEFAULT_EXAM_WEIGHT,
    caWeight: DEFAULT_CA_WEIGHT,
    includeExam: true,
    includeCa: true,
  },
  {
    name: "Fondements de l'IA (FIA)",
    coef: 2,
    exam: "",
    ca: "",
    examWeight: DEFAULT_EXAM_WEIGHT,
    caWeight: DEFAULT_CA_WEIGHT,
    includeExam: true,
    includeCa: true,
  },
  {
    name: "Genie Logiciel",
    coef: 4,
    exam: "",
    ca: "",
    examWeight: DEFAULT_EXAM_WEIGHT,
    caWeight: DEFAULT_CA_WEIGHT,
    includeExam: true,
    includeCa: true,
  },
  {
    name: "Systeme d'Exploitation: Synchro et comm (SYS2)",
    coef: 3,
    exam: "",
    ca: "",
    examWeight: DEFAULT_EXAM_WEIGHT,
    caWeight: DEFAULT_CA_WEIGHT,
    includeExam: true,
    includeCa: true,
  },
  {
    name: "Techniques d'Optimisation (TOp)",
    coef: 3,
    exam: "",
    ca: "",
    examWeight: DEFAULT_EXAM_WEIGHT,
    caWeight: DEFAULT_CA_WEIGHT,
    includeExam: true,
    includeCa: true,
  },
];

export const START_TEMPLATES = [
  {
    id: "eng3-gl-s1",
    title: "Engineer 3rd GL Sem 1",
    subtitle: "Current template",
    rows: DEFAULT_ROWS,
  },
  {
    id: "eng3-gl-s1-a",
    title: "Engineer 3rd GL Sem 1 A",
    subtitle: "Current template clone",
    rows: DEFAULT_ROWS,
  },
  {
    id: "eng3-gl-s1-b",
    title: "Engineer 3rd GL Sem 1 B",
    subtitle: "Current template clone",
    rows: DEFAULT_ROWS,
  },
  {
    id: "eng3-gl-s1-c",
    title: "Engineer 3rd GL Sem 1 C",
    subtitle: "Current template clone",
    rows: DEFAULT_ROWS,
  },
];
