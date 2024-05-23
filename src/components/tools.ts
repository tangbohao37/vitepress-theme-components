import { marked } from 'marked';

export interface IChangelog {
  version: any;
  date: string;
  changes: Record<string, string[]>;
}

export const parseChangelog = (changelogText: string) => {
  const tokens = marked.lexer(changelogText);
  const changelog: IChangelog[] = [];
  let currentVersion: IChangelog = null;
  let currentSection = null;

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
