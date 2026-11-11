import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STARTER_PROMPTS,
  normalizeViewMode,
  validatePromptInput,
  deriveCategories,
  deleteCategoryFromVault,
  filterPrompts,
  parseImportedPrompts,
  mergeRemoteAndLocalPrompts
} from './promptLogic';

test('normalizeViewMode always returns details format', () => {
  assert.equal(normalizeViewMode(undefined), 'details');
  assert.equal(normalizeViewMode('tiles'), 'details');
  assert.equal(normalizeViewMode('details'), 'details');
});

test('validatePromptInput catches missing title, category, and body', () => {
  const emptyResult = validatePromptInput({ title: '  ', category: '', body: '' });
  assert.equal(emptyResult.valid, false);
  assert.ok(emptyResult.errors.title);
  assert.ok(emptyResult.errors.category);
  assert.ok(emptyResult.errors.body);

  const customEmpty = validatePromptInput({
    title: 'Valid Title',
    category: '__custom__',
    customCategory: '   ',
    body: 'Valid prompt body'
  });
  assert.equal(customEmpty.valid, false);
  assert.ok(customEmpty.errors.category);

  const validCustom = validatePromptInput({
    title: 'Valid Title',
    category: '__custom__',
    customCategory: 'Marketing & SEO',
    body: 'Write a comprehensive SEO brief...'
  });
  assert.equal(validCustom.valid, true);
  assert.deepEqual(validCustom.errors, {});
});

test('deriveCategories merges default categories with custom prompt categories without duplicates', () => {
  const customPrompts = [
    ...STARTER_PROMPTS,
    {
      id: 'p-custom',
      title: 'Growth Funnel Analysis',
      category: 'Marketing & SEO',
      body: 'Analyze conversion drop-off...',
      createdAt: '2026-11-10T00:00:00.000Z',
      updatedAt: '2026-11-10T00:00:00.000Z'
    }
  ];
  const cats = deriveCategories(customPrompts);
  assert.equal(cats[0], 'All');
  assert.ok(cats.includes('Video & AI'));
  assert.ok(cats.includes('Coding & Web'));
  assert.ok(cats.includes('Marketing & SEO'));
});

test('filterPrompts filters by category and multi-word search query across title, category, and body', () => {
  const videoOnly = filterPrompts(STARTER_PROMPTS, 'Video & AI', '');
  assert.equal(videoOnly.length, 1);
  assert.equal(videoOnly[0].id, 'prompt-1');

  const keywordSearch = filterPrompts(STARTER_PROMPTS, 'All', 'postgresql lateral');
  assert.equal(keywordSearch.length, 1);
  assert.equal(keywordSearch[0].id, 'prompt-5');

  const combined = filterPrompts(STARTER_PROMPTS, 'Design & Art', 'swiss');
  assert.equal(combined.length, 1);
  assert.equal(combined[0].id, 'prompt-4');
});

test('parseImportedPrompts parses both array format and wrapped { prompts } format without tags', () => {
  const exportedJson = JSON.stringify({
    version: '1.0',
    exportedAt: '2026-11-11T00:00:00.000Z',
    prompts: [
      {
        id: 'custom-1',
        title: 'System Architecture Review',
        category: 'Architecture',
        body: 'Review distributed microservices...'
      }
    ]
  });

  const parsed = parseImportedPrompts(exportedJson);
  assert.equal(parsed.prompts.length, 1);
  assert.equal(parsed.prompts[0].title, 'System Architecture Review');
  assert.ok(parsed.categories.includes('Architecture'));

  assert.throws(() => parseImportedPrompts('{bad json'), /Invalid JSON/);
  assert.throws(() => parseImportedPrompts('{"prompts": []}'), /No valid prompts/);
});

test('mergeRemoteAndLocalPrompts merges new prompts from prompts.json with local unsaved prompts', () => {
  const remote = [
    ...STARTER_PROMPTS,
    {
      id: 'remote-new-7',
      title: 'New Prompt Added via Replaced prompts.json',
      category: 'Coding & Web',
      body: 'Fetched automatically from ./prompts.json on GitHub Pages.',
      createdAt: '2026-11-11T06:00:00.000Z',
      updatedAt: '2026-11-11T06:00:00.000Z'
    }
  ];
  const local = [
    {
      id: 'local-draft-1',
      title: 'Local Unexported Prompt',
      category: 'Video & AI',
      body: 'Created in browser before exporting.',
      createdAt: '2026-11-11T06:10:00.000Z',
      updatedAt: '2026-11-11T06:10:00.000Z'
    },
    ...STARTER_PROMPTS
  ];

  const merged = mergeRemoteAndLocalPrompts(remote, local);
  assert.equal(merged.length, STARTER_PROMPTS.length + 2);
  assert.equal(merged[0].id, 'local-draft-1');
  assert.ok(merged.some((p) => p.id === 'remote-new-7'));
});

test('deleteCategoryFromVault removes category and either deletes its prompts or reassigns them', () => {
  const initialCats = ['Video & AI', 'Coding & Web', 'Design & Art'];
  const deletedWithPrompts = deleteCategoryFromVault(
    'Coding & Web',
    initialCats,
    STARTER_PROMPTS,
    true
  );
  assert.equal(deletedWithPrompts.categories.includes('Coding & Web'), false);
  assert.equal(
    deletedWithPrompts.prompts.some((p) => p.category === 'Coding & Web'),
    false
  );

  const reassigned = deleteCategoryFromVault(
    'Video & AI',
    initialCats,
    STARTER_PROMPTS,
    false
  );
  assert.equal(reassigned.categories.includes('Video & AI'), false);
  assert.equal(reassigned.prompts.length, STARTER_PROMPTS.length);
  assert.equal(reassigned.prompts[0].category, 'Coding & Web');
});
