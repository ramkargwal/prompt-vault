export interface PromptItem {
  id: string;
  title: string;
  category: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'details';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export const DEFAULT_CATEGORIES = [
  'All',
  'Video & AI',
  'Coding & Web',
  'Content Writing',
  'Design & Art'
];

export const STARTER_PROMPTS: PromptItem[] = [
  {
    id: 'prompt-1',
    title: 'Cinematic Anamorphic Drone Sequence',
    category: 'Video & AI',
    body: 'Generate a slow-motion 24fps cinematic FPV drone tracking shot gliding through a mist-covered brutalist concrete canyon at blue hour. Shot on ARRI Alexa Mini LF with Atlas Orion 40mm anamorphic lens, subtle horizontal amber lens flare, volumetric fog diffusing warm tungsten architectural spotlights, hyper-detailed wet concrete reflections, natural film grain.',
    createdAt: '2026-10-15T09:30:00.000Z',
    updatedAt: '2026-10-15T09:30:00.000Z'
  },
  {
    id: 'prompt-2',
    title: 'TypeScript Zero-Dependency State Store Architect',
    category: 'Coding & Web',
    body: 'Act as a Principal Frontend Architect. Design a type-safe, zero-dependency reactive state store in TypeScript (< 120 lines) supporting selector-based subscriptions, structural equality checks, middleware hooks, and LocalStorage persistence with schema migration support. Include strict generics, JSDoc examples, and unit test cases using node:test.',
    createdAt: '2026-10-18T14:20:00.000Z',
    updatedAt: '2026-10-18T14:20:00.000Z'
  },
  {
    id: 'prompt-3',
    title: 'Technical Product Launch Narrative & Memo',
    category: 'Content Writing',
    body: 'Write an executive-grade product launch announcement in the style of a clear, high-signal engineering memo. Open with the exact bottleneck developers face today, quantify the latency or workflow tax, introduce our architectural approach without marketing clichés or buzzwords, and walk through 3 concrete before-and-after customer workflows.',
    createdAt: '2026-10-22T11:10:00.000Z',
    updatedAt: '2026-10-22T11:10:00.000Z'
  },
  {
    id: 'prompt-4',
    title: 'Swiss International Typographic Poster Grid',
    category: 'Design & Art',
    body: 'Create a Swiss International Style exhibition poster composition inspired by Josef Müller-Brockmann. Strict asymmetric 12-column modular grid, stark matte off-white archival paper texture (#F4F1EA), deep carbon ink (#141413), and a single International Orange accent (#FF3B00). Geometric kinetic arcs intersecting crisp neo-grotesque typography.',
    createdAt: '2026-10-25T16:45:00.000Z',
    updatedAt: '2026-10-25T16:45:00.000Z'
  },
  {
    id: 'prompt-5',
    title: 'PostgreSQL Query Plan & Index Optimization Audit',
    category: 'Coding & Web',
    body: 'Analyze the following PostgreSQL EXPLAIN (ANALYZE, BUFFERS) output and table schema. Identify sequential scans, high-cost nested loops, heap fetches, and sort spills. Recommend composite or partial B-Tree/GIN indexes, rewrite correlated subqueries as CTEs or lateral joins, and estimate the I/O reduction.',
    createdAt: '2026-11-01T08:15:00.000Z',
    updatedAt: '2026-11-01T08:15:00.000Z'
  },
  {
    id: 'prompt-6',
    title: 'Industrial Tactile Hardware Product Render',
    category: 'Design & Art',
    body: 'Studio macro product photography of a modular portable synthesizer crafted from bead-blasted anodized aluminum and matte polycarbonate keycaps, inspired by Teenage Engineering and Braun 1960s industrial design. Soft diffused overhead bank lighting, crisp chamfered edges, OLED high-contrast amber matrix display, shot on Hasselblad H6D-100c 120mm macro.',
    createdAt: '2026-11-04T19:00:00.000Z',
    updatedAt: '2026-11-04T19:00:00.000Z'
  }
];

export function normalizeViewMode(_mode?: string | null): ViewMode {
  return 'details';
}

export function validatePromptInput(input: {
  title?: string;
  category?: string;
  customCategory?: string;
  body?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};
  const title = (input.title ?? '').trim();
  const rawCategory =
    input.category === '__custom__'
      ? (input.customCategory ?? '').trim()
      : (input.category ?? '').trim();
  const body = (input.body ?? '').trim();

  if (!title) {
    errors.title = 'Prompt title is required.';
  } else if (title.length > 120) {
    errors.title = 'Prompt title must be 120 characters or fewer.';
  }

  if (!rawCategory || rawCategory.toLowerCase() === 'all') {
    errors.category = 'Please select or enter a valid category name.';
  } else if (rawCategory.length > 40) {
    errors.category = 'Category name must be 40 characters or fewer.';
  }

  if (!body) {
    errors.body = 'Full prompt text is required.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function deriveCategories(
  prompts: PromptItem[],
  savedCategories: string[] = []
): string[] {
  const seen = new Set<string>(['all']);
  const result: string[] = ['All'];

  const addCat = (cat: string) => {
    const trimmed = (cat || '').trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(trimmed);
    }
  };

  const baseList =
    savedCategories.length > 0 ? savedCategories : DEFAULT_CATEGORIES.slice(1);
  baseList.forEach(addCat);
  prompts.forEach((p) => addCat(p.category));

  return result;
}

export function deleteCategoryFromVault(
  targetCategory: string,
  categories: string[],
  prompts: PromptItem[],
  deletePromptsInCategory: boolean = false
): {
  categories: string[];
  prompts: PromptItem[];
} {
  const targetNorm = (targetCategory || '').trim().toLowerCase();
  if (!targetNorm || targetNorm === 'all') {
    return { categories, prompts };
  }

  const remainingCategories = categories.filter((c) => {
    const norm = c.trim().toLowerCase();
    return norm !== targetNorm && norm !== 'all';
  });

  if (deletePromptsInCategory) {
    const remainingPrompts = prompts.filter(
      (p) => p.category.trim().toLowerCase() !== targetNorm
    );
    return { categories: remainingCategories, prompts: remainingPrompts };
  }

  const fallbackCategory = remainingCategories[0] || 'General';
  if (remainingCategories.length === 0) {
    remainingCategories.push(fallbackCategory);
  }

  const reassignedPrompts = prompts.map((p) =>
    p.category.trim().toLowerCase() === targetNorm
      ? { ...p, category: fallbackCategory }
      : p
  );

  return { categories: remainingCategories, prompts: reassignedPrompts };
}

export function filterPrompts(
  prompts: PromptItem[],
  activeCategory: string,
  searchQuery: string
): PromptItem[] {
  const normalizedCategory = (activeCategory || 'All').trim().toLowerCase();
  const query = (searchQuery || '').trim().toLowerCase();
  const tokens = query ? query.split(/\s+/).filter(Boolean) : [];

  return prompts.filter((prompt) => {
    const matchesCategory =
      normalizedCategory === 'all' ||
      prompt.category.trim().toLowerCase() === normalizedCategory;

    if (!matchesCategory) return false;
    if (tokens.length === 0) return true;

    const haystack = [prompt.title, prompt.category, prompt.body]
      .join(' ')
      .toLowerCase();

    return tokens.every((token) => haystack.includes(token));
  });
}

export function parseImportedPrompts(jsonString: string): {
  prompts: PromptItem[];
  categories: string[];
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid JSON file format.');
  }

  const rawList = Array.isArray(parsed)
    ? parsed
    : parsed &&
        typeof parsed === 'object' &&
        Array.isArray((parsed as { prompts?: unknown }).prompts)
      ? (parsed as { prompts: unknown[] }).prompts
      : null;

  if (!rawList) {
    throw new Error('JSON must contain an array of prompts or a { prompts: [...] } object.');
  }

  const validPrompts: PromptItem[] = [];
  for (let i = 0; i < rawList.length; i++) {
    const item = rawList[i] as Record<string, unknown>;
    if (!item || typeof item !== 'object') continue;
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    const category = typeof item.category === 'string' ? item.category.trim() : '';
    const body = typeof item.body === 'string' ? item.body.trim() : '';
    if (!title || !category || !body) continue;

    const id =
      typeof item.id === 'string' && item.id.trim()
        ? item.id.trim()
        : `imported-${Date.now()}-${i}`;
    const now = new Date().toISOString();

    validPrompts.push({
      id,
      title,
      category,
      body,
      createdAt: typeof item.createdAt === 'string' ? item.createdAt : now,
      updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : now
    });
  }

  if (validPrompts.length === 0) {
    throw new Error('No valid prompts found in the uploaded JSON file.');
  }

  const extraCats =
    parsed &&
    typeof parsed === 'object' &&
    Array.isArray((parsed as { categories?: unknown }).categories)
      ? ((parsed as { categories: unknown[] }).categories.filter(
          (c): c is string => typeof c === 'string'
        ))
      : [];

  return {
    prompts: validPrompts,
    categories: deriveCategories(validPrompts, extraCats)
  };
}

export function mergeRemoteAndLocalPrompts(
  remotePrompts: PromptItem[],
  localPrompts: PromptItem[]
): PromptItem[] {
  const remoteIds = new Set(remotePrompts.map((p) => p.id));
  const localById = new Map(localPrompts.map((p) => [p.id, p]));

  // Local unsaved additions (not yet in remote prompts.json) stay at the top
  const localOnly = localPrompts.filter((p) => !remoteIds.has(p.id));

  // For items in prompts.json, prefer whichever version has a newer updatedAt timestamp
  const mergedRemote = remotePrompts.map((remoteItem) => {
    const localItem = localById.get(remoteItem.id);
    if (!localItem) return remoteItem;
    const remoteTime = Date.parse(remoteItem.updatedAt || '') || 0;
    const localTime = Date.parse(localItem.updatedAt || '') || 0;
    return localTime > remoteTime ? localItem : remoteItem;
  });

  return [...localOnly, ...mergedRemote];
}
