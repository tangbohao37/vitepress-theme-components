export interface IChange {
  category: string;
  component: string;
  description: string;
}

export interface IChangelog {
  version: any;
  date: any;
  changes: Array<IChange>;
}

export function parseChangelog(changelogText: string) {
  const changelogLines = changelogText.split('\n\n');
  const changelogObject: IChangelog[] = [];

  let currentCategory = '';
  for (const line of changelogLines) {
    if (line.startsWith('## ')) {
      const [, version, date] = line.split(' ');

      changelogObject.push({
        version: version,
        date: date,
        changes: []
      });
    } else if (line.startsWith('### ')) {
      currentCategory = line.slice(4);
    } else if (line.startsWith('- ')) {
      const changeText = line.slice(2);
      const match = /\*\*(.*?):\*\*/g.exec(changeText);
      const version = changelogObject[changelogObject.length - 1];
      let component = '';
      if (match?.[1]) {
        component = match[1].toUpperCase();
      }
      version?.changes?.push({
        category: currentCategory,
        component: component,
        description: changeText
      });
    }
  }

  return changelogObject;
}

export const readFileAsync = async (p: string) => {
  if (!p) {
    return;
  }
  return await fetch(p);
};
