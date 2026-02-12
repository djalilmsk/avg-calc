export const DEFAULT_EXAM_WEIGHT = 0.6;
export const DEFAULT_CA_WEIGHT = 0.4;

export const STORAGE_KEY = "semester_avg_app_v1";
export const HISTORY_LIMIT = 80;
export const SNAPSHOT_LIMIT = 30;
export const SNAPSHOT_VISIBLE_LIMIT = 6;
export const MAX_TEMPLATE_STORAGE = 12;

function createRow(
  name,
  coef,
  {
    examWeight = DEFAULT_EXAM_WEIGHT,
    caWeight = DEFAULT_CA_WEIGHT,
    includeExam = true,
    includeCa = true,
  } = {},
) {
  return {
    name,
    coef,
    exam: "",
    ca: "",
    examWeight,
    caWeight,
    includeExam,
    includeCa,
  };
}

const templates = [
  [
    createRow("Algorithmique et Complexite avancees", 4),
    createRow("BDD: Administration et architecture", 4),
    createRow("Fondements de l'IA (FIA)", 2),
    createRow("Genie Logiciel", 4),
    createRow("Systeme d'Exploitation: Synchro et comm (SYS2)", 3),
    createRow("Techniques d'Optimisation (TOp)", 3),
  ],
  [
    createRow("Compilation", 4, { examWeight: 0.5, caWeight: 0.5 }),
    createRow("Software Engineering", 2, { examWeight: 0.6, caWeight: 0.4 }),
    createRow("Mathematical Tools for Cryptography", 4, {
      examWeight: 0.5,
      caWeight: 0.5,
    }),
    createRow("Operational Research", 4, { examWeight: 0.5, caWeight: 0.5 }),
    createRow("Python Programming", 2, { examWeight: 0.6, caWeight: 0.4 }),
    createRow("Web Development", 2, { examWeight: 0.6, caWeight: 0.4 }),
    createRow("Business Intelligence", 1, {
      examWeight: 1,
      caWeight: 0,
      includeCa: false,
    }),
    createRow("Theory of Information and Coding", 1, {
      examWeight: 0.6,
      caWeight: 0.4,
    }),
  ],
  [
    createRow("SE", 3, { examWeight: 0.5, caWeight: 0.5 }),
    createRow("RO", 2, { examWeight: 0.67, caWeight: 0.33 }),
    createRow("RIP", 3, { examWeight: 0.5, caWeight: 0.5 }),
    createRow("ABD", 2, { examWeight: 0.5, caWeight: 0.5 }),
    createRow("IS", 2, { examWeight: 0.5, caWeight: 0.5 }),
    createRow("COMP", 2, { examWeight: 0.67, caWeight: 0.33 }),
    createRow("GL", 2, { examWeight: 0.67, caWeight: 0.33 }),
  ],
];

export const DEFAULT_ROWS = templates[0];

export const START_TEMPLATES = [
  {
    id: "software-engineering-3y-s1-engineering",
    name: "Software Engineering",
    year: "3rd Year",
    semester: "S1",
    rows: templates[0],
  },
  {
    id: "cyber-security-3y-s1-engineering",
    name: "Cyber Security",
    year: "3rd Year",
    semester: "S1",
    rows: templates[1],
  },
  {
    id: "computer-science-3y-s1-engineering",
    name: "Computer Science",
    year: "3rd Year",
    semester: "S1",
    rows: templates[2],
  }
];
