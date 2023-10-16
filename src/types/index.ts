import { type DefaultTheme } from 'vitepress';
import { type IReactLive } from '../react-components';

export interface ILiveEditor extends IReactLive {
  sourceCodePath?: string;
  hideCode?: boolean;
  noStyle?: boolean;
}

type IChangelog = {
  path: string;
  parse?: (content: string) => void;
};

type ICoverage = {
  path: string;
  parse?: (content: string) => void;
};

export interface AdvThemeConfig extends DefaultTheme.Config {
  changelog?: IChangelog;
  coverage?: ICoverage;
}
