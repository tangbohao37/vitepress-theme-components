import { type DefaultTheme } from 'vitepress';
import { type IReactLive } from '../react-components';

export interface ILiveEditor extends /* @vue-ignore */ IReactLive {
  sourceCodePath?: string;
  hideCode?: boolean;
  noStyle?: boolean;
  sourceCode?: string;
  scope?: Record<string, any>;
}

type IChangelog = {
  path: string;
  parse?: (content: string) => void;
};

type ICoverage = {
  path: string;
  parse?: (content: string) => void;
};

export type MdFormat = {
  hideRecord?: boolean;
  coverage?: boolean;
  componentName?: string;
};

export interface AdvThemeConfig extends /* @vue-ignore */ DefaultTheme.Config {
  changelog?: IChangelog;
  coverage?: ICoverage;
}
