import {
  BookOpen,
  Compass,
  Copy,
  Edit,
  History,
  Keyboard,
  Layers,
  Pin,
  Plus,
  Redo2,
  Settings,
  Sidebar,
  Undo2,
  X
} from "lucide-react";

export const DOC_SECTIONS = [
  {
    id: "start",
    title: "Start Fast",
    subtitle: "From empty screen to working average.",
    icon: Compass,
    items: [
      {
        icon: Plus,
        title: "Create History",
        text: "Use Home card or bottom composer."
      },
      {
        icon: Layers,
        title: "Use Template",
        text: "Start with ready module structure."
      },
      {
        icon: History,
        title: "Open Calculator",
        text: "You move to /calc/:history-id."
      }
    ]
  },
  {
    id: "sidebar",
    title: "Sidebar Actions",
    subtitle: "Everything you can do on a history row.",
    icon: Sidebar,
    items: [
      {
        icon: Pin,
        title: "Pin",
        text: "Keep important histories on top."
      },
      {
        icon: Copy,
        title: "Duplicate",
        text: "Branch a scenario instantly."
      },
      {
        icon: X,
        title: "Delete",
        text: "Remove history and its timeline."
      },
      {
        icon: Layers,
        title: "Tpl",
        text: "Create a template from history."
      }
    ]
  },
  {
    id: "top-controls",
    title: "Top Controls",
    subtitle: "Quick tools in the header.",
    icon: Settings,
    items: [
      {
        icon: Undo2,
        title: "Undo",
        text: "Step back in current history."
      },
      {
        icon: Redo2,
        title: "Redo",
        text: "Restore undone changes."
      },
      {
        icon: Settings,
        title: "Preferences",
        text: "Theme, font, and roundness."
      },
      {
        icon: BookOpen,
        title: "Docs",
        text: "Open this guide anytime."
      }
    ]
  },
  {
    id: "shortcuts",
    title: "Shortcuts",
    subtitle: "Keyboard combos for faster flow.",
    icon: Keyboard,
    shortcuts: [
      {
        keys: ["Alt", "Enter"],
        action: "Next history"
      },
      {
        keys: ["Alt", "Shift", "Enter"],
        action: "Previous history"
      },
      {
        keys: ["Enter"],
        action: "Submit while typing module in add bar"
      }
    ]
  },
  {
    id: "limits",
    title: "Limits",
    subtitle: "Storage and behavior to remember.",
    icon: BookOpen,
    items: [
      {
        icon: Layers,
        title: "Templates",
        text: "Maximum 12 saved templates."
      },
      {
        icon: History,
        title: "Undo Stack",
        text: "Up to 80 timeline states."
      },
      {
        icon: BookOpen,
        title: "Persistence",
        text: "Data saved in browser local storage."
      }
    ]
  }
];

export const QUICK_LINKS = [
  {
    icon: Edit,
    title: "Go Home",
    text: "Create a new history.",
    to: "/"
  },
  {
    icon: Layers,
    title: "Templates",
    text: "Jump to template actions.",
    to: "#sidebar"
  },
  {
    icon: Keyboard,
    title: "Shortcuts",
    text: "See all keyboard combos.",
    to: "#shortcuts"
  }
];

