import { marked } from 'marked';
import * as semver from 'semver';

export interface IChangelog {
  version: string;
  date: string;
  changes: Record<string, string[]>;
}

export interface IChangelogBlock {
  version: string;
  date: string;
  startLine: number;
  endLine: number;
}

export interface IChangelogMeta {
  blocks: IChangelogBlock[];
  sections: string[];
}

export interface IChangelogSearchParams {
  versionFrom: string;
  versionTo: string;
  sections: string[];
  componentKeyword?: string;
}

const VERSION_HEADING_REGEXP =
  /^###\s+(?:\[([^\]]+)\](?:\([^)]+\))?|(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?))(?:\s|$)/;
const DATE_REGEXP = /\((\d{4}-\d{2}-\d{2})\)/;
const SECTION_HEADING_REGEXP = /^###\s+(.+)$/;
const LIST_ITEM_REGEXP = /^\s*[-*]\s+(.+)$/;

interface IParsedChangelogCache {
  source: string;
  lines: string[];
  meta: IChangelogMeta;
  cacheVersion: number;
}

let cachedParsedChangelog: IParsedChangelogCache | null = null;
let parsedCacheVersion = 0;
const SEARCH_RESULT_CACHE_LIMIT = 50;
const searchResultCache = new Map<string, IChangelog[]>();

const parseMetaFromLines = (lines: string[]): IChangelogMeta => {
  const blocks: IChangelogBlock[] = [];
  const sectionSet = new Set<string>();
  let currentBlock: IChangelogBlock | null = null;
  lines.forEach((line, lineIndex) => {
    const versionMatch = line.match(VERSION_HEADING_REGEXP);
    if (versionMatch) {
      if (currentBlock) {
        currentBlock.endLine = lineIndex;
        blocks.push(currentBlock);
      }
      const version = versionMatch[1] || versionMatch[2] || '';
      const date = line.match(DATE_REGEXP)?.[1] || '';
      currentBlock = {
        version,
        date,
        startLine: lineIndex,
        endLine: lines.length
      };
      return;
    }
    const sectionMatch = line.match(SECTION_HEADING_REGEXP);
    if (!sectionMatch) {
      return;
    }
    if (VERSION_HEADING_REGEXP.test(line)) {
      return;
    }
    sectionSet.add(sectionMatch[1]);
  });
  if (currentBlock) {
    blocks.push(currentBlock);
  }
  return {
    blocks,
    sections: Array.from(sectionSet)
  };
};

const getOrCreateParsedCache = (changelogText: string): IParsedChangelogCache => {
  if (cachedParsedChangelog && cachedParsedChangelog.source === changelogText) {
    return cachedParsedChangelog;
  }
  parsedCacheVersion += 1;
  const lines = changelogText.split('\n');
  cachedParsedChangelog = {
    source: changelogText,
    lines,
    meta: parseMetaFromLines(lines),
    cacheVersion: parsedCacheVersion
  };
  searchResultCache.clear();
  return cachedParsedChangelog;
};

const getSortedVersionRange = (
  versionFrom: string,
  versionTo: string
): [string, string] | null => {
  if (!versionFrom || !versionTo) {
    return null;
  }
  if (!semver.valid(versionFrom) || !semver.valid(versionTo)) {
    return null;
  }
  return [versionFrom, versionTo].sort(semver.compare) as [string, string];
};

export const getChangelogMeta = (changelogText: string): IChangelogMeta => {
  if (!changelogText) {
    return {
      blocks: [],
      sections: []
    };
  }
  return getOrCreateParsedCache(changelogText).meta;
};

export const parseChangelogByBlocks = (
  changelogText: string,
  targetBlocks: IChangelogBlock[],
  selectedSections: string[],
  sourceLines?: string[]
) => {
  if (!changelogText || !targetBlocks.length || !selectedSections.length) {
    return [];
  }

  const sectionSet = new Set(selectedSections);
  const lines = sourceLines || changelogText.split('\n');
  const changelog: IChangelog[] = [];

  targetBlocks.forEach((block) => {
    const changes: Record<string, string[]> = {};
    let currentSection = '';
    const blockLines = lines.slice(block.startLine, block.endLine);

    blockLines.forEach((line) => {
      const sectionMatch = line.match(SECTION_HEADING_REGEXP);
      if (sectionMatch) {
        const section = sectionMatch[1];
        if (VERSION_HEADING_REGEXP.test(line)) {
          return;
        }
        currentSection = section;
        if (sectionSet.has(section) && !changes[section]) {
          changes[section] = [];
        }
        return;
      }

      if (!currentSection || !sectionSet.has(currentSection)) {
        return;
      }

      const listItemMatch = line.match(LIST_ITEM_REGEXP);
      if (!listItemMatch) {
        return;
      }
      changes[currentSection].push(listItemMatch[1]);
    });

    if (Object.keys(changes).length) {
      changelog.push({
        version: block.version,
        date: block.date,
        changes
      });
    }
  });

  return changelog;
};

const buildSearchCacheKey = (
  cacheVersion: number,
  versionFrom: string,
  versionTo: string,
  sections: string[],
  keyword: string
) => {
  return [
    cacheVersion,
    versionFrom,
    versionTo,
    sections.join('|'),
    keyword
  ].join('::');
};

const saveSearchResultToCache = (cacheKey: string, value: IChangelog[]) => {
  if (searchResultCache.has(cacheKey)) {
    searchResultCache.delete(cacheKey);
  }
  searchResultCache.set(cacheKey, value);
  if (searchResultCache.size <= SEARCH_RESULT_CACHE_LIMIT) {
    return;
  }
  const oldestKey = searchResultCache.keys().next().value;
  if (oldestKey) {
    searchResultCache.delete(oldestKey);
  }
};

export const searchChangelogByRange = (
  changelogText: string,
  params: IChangelogSearchParams
) => {
  if (!changelogText || !params.sections.length) {
    return [];
  }
  const sortedRange = getSortedVersionRange(params.versionFrom, params.versionTo);
  if (!sortedRange) {
    return [];
  }
  const [versionFrom, versionTo] = sortedRange;
  const normalizedSections = Array.from(new Set(params.sections)).sort();
  const keyword = (params.componentKeyword || '').trim().toUpperCase();
  const { lines, meta, cacheVersion } = getOrCreateParsedCache(changelogText);
  const cacheKey = buildSearchCacheKey(
    cacheVersion,
    versionFrom,
    versionTo,
    normalizedSections,
    keyword
  );
  const cached = searchResultCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const targetBlocks = meta.blocks.filter((block) =>
    semver.satisfies(block.version, `>=${versionFrom} <=${versionTo}`)
  );
  const changelog = parseChangelogByBlocks(
    changelogText,
    targetBlocks,
    normalizedSections,
    lines
  );
  if (!keyword) {
    saveSearchResultToCache(cacheKey, changelog);
    return changelog;
  }
  const filteredChangelog = changelog
    .map((log) => {
      const changes = Object.entries(log.changes).reduce(
        (acc, [section, records]) => {
          const filtered = records.filter((record) =>
            record.toUpperCase().includes(keyword)
          );
          if (filtered.length) {
            acc[section] = filtered;
          }
          return acc;
        },
        {} as Record<string, string[]>
      );
      return {
        ...log,
        changes
      };
    })
    .filter((log) => Object.keys(log.changes).length);
  saveSearchResultToCache(cacheKey, filteredChangelog);
  return filteredChangelog;
};

export const parseChangelog = (changelogText: string) => {
  const tokens = marked.lexer(changelogText);
  const changelog: IChangelog[] = [];
  let currentVersion: IChangelog | null = null;
  let currentSection = '';

  tokens.forEach((token) => {
    if (token.type === 'heading' && token.depth === 2) {
      if (currentVersion) {
        changelog.push(currentVersion);
      }
      const [version, date] = token.text.split(' ');
      currentVersion = { version: version, date: date, changes: {} };
    }
    if (
      token.type === 'heading' &&
      token.depth === 3 &&
      currentVersion &&
      !token.text.startsWith('[')
    ) {
      currentSection = token.text;
      if (!currentVersion.changes[currentSection]) {
        currentVersion.changes[currentSection] = [];
      }
    }
    if (token.type === 'list' && currentVersion && currentSection) {
      currentVersion.changes[currentSection].push(
        token.items.map((item) => item.text).join(' ')
      );
    }
  });

  if (currentVersion) {
    changelog.push(currentVersion);
  }
  return changelog;
};

export const readFileAsync = async (p: string) => {
  if (!p) {
    return;
  }
  return await fetch(p);
};
