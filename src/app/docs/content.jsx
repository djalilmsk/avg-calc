import {
  BookOpen,
  Compass,
  Copy,
  Edit,
  Github,
  History,
  Keyboard,
  Layers,
  MessageCircle,
  Pin,
  Plus,
  Redo2,
  Settings,
  Sidebar,
  Star,
  Undo2,
  UserRound,
  X,
} from "lucide-react";
import { APP_SHORTCUTS } from "@/lib/shortcuts";

const START_FAST_TEMPLATES = [
  {
    id: "software-engineering-3y-s1-engineering",
    name: "Software Engineering",
    year: "3rd Year",
    semester: "S1",
  },
  {
    id: "cyber-security-3y-s1-engineering",
    name: "Cyber Security",
    year: "3rd Year",
    semester: "S1",
  },
  {
    id: "computer-science-3y-s1-engineering",
    name: "Computer Science",
    year: "3rd Year",
    semester: "S1",
  },
];

const START_FAST_GUIDES = [
  {
    title: "Getting Started with Add Modules Bar",
    titleClassName: "text-2xl font-semibold mb-3 ml-3 sm:ml-6",
    blocks: [
      {
        type: "paragraph",
        textBefore:
          "You can start from the Add Modules bar by adding your modules and hitting ",
        shortcutKeys: [{ hotkey: APP_SHORTCUTS.submitModule }],
      },
      {
        type: "preview",
        previewType: "fake-input",
        className:
          "overflow-auto flex justify-center items-center bg-primary/15 rounded-xl my-8 px-2",
      },
      {
        type: "paragraph",
        className: "mt-4",
        textBefore:
          "That adds the module to your workspace. You can start using it right away by putting your cursor in the module TD field and typing. You can also use keyboard shortcuts to quickly navigate between Exam and TD by hitting ",
        shortcutKeys: [{ hotkey: APP_SHORTCUTS.navigateGradeFields }],
      },
    ],
  },
  {
    title: "Getting Started with Templates",
    titleClassName: "text-2xl font-semibold mb-3 ml-3 sm:ml-6 mt-10",
    blocks: [
      {
        type: "paragraph",
        text: "If you want to start with a template, you can select one from the templates that matches your needs.",
      },
      {
        type: "preview",
        previewType: "templates-grid",
        className:
          "overflow-auto grid gap-3 grid-cols-2 md:grid-cols-3 justify-center items-center bg-primary/15 rounded-xl my-8 px-4 py-4",
        templates: START_FAST_TEMPLATES,
      },
      {
        type: "paragraph",
        text: "That loads the template into your workspace, and you can start using it right away. You can also customize it by adding or removing modules and changing the layout to fit your needs.",
      },
      {
        type: "paragraph",
        className: "mt-4",
        textBefore: "By clicking ",
        shortcutKeys: ["Right Click"],
        textAfter:
          " on a template, you open the template context menu, where you can update the template name and details or delete the template if you no longer need it.",
      },
    ],
  },
];

const SIDEBAR_ACTIONS_GUIDES = [
  {
    title: "Working with Sidebar Actions",
    titleClassName: "text-2xl font-semibold mb-3 ml-6 mt-10",
    blocks: [
      {
        type: "paragraph",
        textBefore:
          "The sidebar shows your recent histories. Click any history row to open it and continue where you left off.",
      },
      {
        type: "paragraph",
        textBefore:
          "Each row includes quick actions. Start by renaming a history using ",
        shortcutKeys: ["Double Click"],
        textAfter: " on the history title to edit it inline.",
        className: "mt-4",
      },
      {
        type: "preview",
        previewType: "sidebar-actions-demo",
        className:
          "overflow-auto bg-primary/15 rounded-xl my-8 px-4 py-4 min-w-0",
        activeHistoryId: "software-engineering-3y-s1-engineering",
        histories: [
          {
            id: "software-engineering-3y-s1-engineering",
            name: "Software Engineering",
            pinned: true,
          },
          {
            id: "cyber-security-3y-s1-engineering",
            name: "Cyber Security",
            pinned: false,
          },
          {
            id: "computer-science-3y-s1-engineering",
            name: "Computer Science",
            pinned: false,
          },
        ],
      },
      {
        type: "paragraph",
        text: "Use Pin for your most important histories, Duplicate when you want to compare outcomes, and Tpl when you want to reuse the same module setup later and it will appear in your templates home page.",
      },
    ],
  },
];

const TOP_CONTROLS_GUIDES = [
  {
    title: "Using Top Controls",
    titleClassName: "text-2xl font-semibold mb-3 ml-6 mt-10",
    blocks: [
      {
        type: "paragraph",
        text: "The top controls give you quick access to editing and app-level actions while working in a history.",
      },
      {
        type: "preview",
        previewType: "top-controls-demo",
        className:
          "overflow-auto flex justify-center items-center bg-primary/15 rounded-xl my-8 px-4 py-4",
        controls: [
          { icon: Undo2, label: "Undo" },
          { icon: Redo2, label: "Redo" },
          { icon: Settings, label: "Preferences" },
          { icon: BookOpen, label: "Docs" },
          { icon: Edit, label: "New Workspace" },
        ],
      },
      {
        type: "paragraph",
        text: "Use Undo and Redo to move through recent changes, Preferences to adjust theme, font, and roundness, Docs to quickly return to this guide, and New Workspace takes you to the home page to start a new template.",
      },
    ],
  },
];

export const DOC_SECTIONS = [
  {
    id: "start",
    title: "Start Fast",
    subtitle: "From empty screen to working average.",
    icon: Compass,
    guides: START_FAST_GUIDES,
    items: [
      {
        icon: Plus,
        title: "Create History",
        text: "Use Home card or bottom composer.",
      },
      {
        icon: Layers,
        title: "Use Template",
        text: "Start with ready module structure.",
      },
      {
        icon: History,
        title: "Open Calculator",
        text: "You move to /calc/:history-id.",
      },
    ],
  },
  {
    id: "sidebar",
    title: "Sidebar Actions",
    subtitle: "Everything you can do on a history row.",
    icon: Sidebar,
    guides: SIDEBAR_ACTIONS_GUIDES,
    items: [
      {
        icon: Pin,
        title: "Pin",
        text: "Keep important histories on top.",
      },
      {
        icon: Copy,
        title: "Duplicate",
        text: "Branch a scenario instantly.",
      },
      {
        icon: X,
        title: "Delete",
        text: "Remove history and its timeline.",
      },
      {
        icon: Layers,
        title: "Tpl",
        text: "Create a template from history.",
      },
    ],
  },
  {
    id: "top-controls",
    title: "Top Controls",
    subtitle: "Quick tools in the header.",
    icon: Settings,
    guides: TOP_CONTROLS_GUIDES,
    items: [
      {
        icon: Undo2,
        title: "Undo",
        text: "Step back in current history.",
      },
      {
        icon: Redo2,
        title: "Redo",
        text: "Restore undone changes.",
      },
      {
        icon: Settings,
        title: "Preferences",
        text: "Theme, font, and roundness.",
      },
      {
        icon: BookOpen,
        title: "Docs",
        text: "Open this guide anytime.",
      },
    ],
  },
  {
    id: "shortcuts",
    title: "Shortcuts",
    subtitle: "Keyboard combos for faster flow.",
    icon: Keyboard,
    shortcuts: [
      {
        hotkey: APP_SHORTCUTS.nextHistory,
        action: "Next history",
      },
      {
        hotkey: APP_SHORTCUTS.previousHistory,
        action: "Previous history",
      },
      {
        hotkey: APP_SHORTCUTS.submitModule,
        action: "Submit while typing module in add bar",
      },
      {
        hotkey: APP_SHORTCUTS.newWorkspace,
        action: "Open new workspace",
      },
      {
        hotkey: APP_SHORTCUTS.navigateGradeFields,
        action: "Navigate between Exam and TD fields while typing",
      },
      {
        hotkey: APP_SHORTCUTS.createTemplate,
        action: "Open create-template dialog for current history",
      },
      {
        hotkey: APP_SHORTCUTS.duplicateHistory,
        action: "Duplicate current history",
      },
      {
        hotkey: APP_SHORTCUTS.deleteHistory,
        action: "Delete current history",
      },
      {
        hotkey: APP_SHORTCUTS.toggleHistoryPinned,
        action: "Pin/unpin current history",
      },
      {
        hotkey: APP_SHORTCUTS.undo,
        action: "Undo",
      },
      {
        hotkey: APP_SHORTCUTS.redo,
        action: "Redo",
      },
      {
        hotkey: APP_SHORTCUTS.focusAddModule,
        action: "Focus Add Module input",
      },
      {
        hotkey: APP_SHORTCUTS.toggleSidebar,
        action: "Toggle sidebar",
      },
    ],
  },
  {
    id: "limits",
    title: "Limits",
    subtitle: "Storage and behavior to remember.",
    icon: BookOpen,
    guides: [
      {
        title: "How Storage Works",
        titleClassName: "text-2xl font-semibold mb-3 ml-3 sm:ml-6",
        blocks: [
          {
            type: "paragraph",
            text: "All CookedCalc data stays on your device. Templates (up to 12) and saved histories are stored in browser localStorage. Histories do not have a fixed app limit, so you can keep adding them until your browser storage quota is reached. Undo/redo timeline states are saved in sessionStorage, limited to 80 states, and they are cleared when you close the browser window or tab.",
          },
        ],
      },
    ],
    items: [
      {
        icon: Layers,
        title: "Templates",
        text: "Maximum 12 saved templates.",
      },
      {
        icon: History,
        title: "Undo Stack",
        text: "Up to 80 timeline states.",
      },
      {
        icon: BookOpen,
        title: "Persistence",
        text: "Data saved in browser local storage.",
      },
    ],
  },
  {
    id: "creator",
    title: "Creator & Open Source",
    subtitle: "Project details, contribution path, and support.",
    icon: UserRound,
    guides: [
      {
        title: "About This Project",
        titleClassName: "text-2xl font-semibold mb-3 ml-3 sm:ml-6",
        blocks: [
          {
            type: "paragraph",
            text: "Pointless? Maybe. Well made? Absolutely.",
          },
          {
            type: "paragraph",
            className: "mt-4",
            text: "CookedCalc is created by Abd eldjallil Meskali (djalilmsk). If there is anything you want added, share it: new themes, new features, better docs sections, or workflow improvements.",
          },
          {
            type: "paragraph",
            className: "mt-4",
            text: "This project is open source. You can contribute by proposing and building new themes or features, and if the project helps you, please leave a star on GitHub.",
          },
        ],
      },
    ],
    items: [
      {
        icon: UserRound,
        title: "Creator",
        text: "Abd eldjallil Meskali (djalilmsk) - djalilmsk.dev",
        href: "https://djalilmsk.dev/links",
      },
      {
        icon: MessageCircle,
        title: "Suggest Additions",
        text: "Tell us what to add next: themes, features, docs updates, or UX improvements.",
        href: "https://github.com/djalilmsk/avg-calc/issues/new",
      },
      {
        icon: Github,
        title: "Contribute",
        text: "Open-source repository: github.com/djalilmsk/avg-calc",
        href: "https://github.com/djalilmsk/avg-calc",
      },
      {
        icon: Star,
        title: "Support",
        text: "Leave a star on GitHub to support the project.",
        href: "https://github.com/djalilmsk/avg-calc/stargazers",
      },
    ],
  },
];

export const QUICK_LINKS = [
  {
    icon: Edit,
    title: "Go Home",
    text: "Create a new history.",
    to: "/",
  },
  {
    icon: Keyboard,
    title: "Shortcuts",
    text: "See all keyboard combos.",
    to: "#shortcuts",
  },
  {
    icon: UserRound,
    title: "Creator",
    text: "Project details and contribution.",
    to: "#creator",
  },
];
