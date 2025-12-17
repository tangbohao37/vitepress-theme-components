import { type DefaultTheme } from 'vitepress';
import { type IReactLive } from '../react-components';

export interface ILiveEditor extends /* @vue-ignore */ IReactLive {
  sourceCodePath?: string;
  hideCode?: boolean;
  noStyle?: boolean;
  sourceCode?: string;
  scope?: Record<string, any>;
}

export interface ISandpackEditor {
  path: string; // 相对于 exampleDir 的文件路径，如 "button.jsx" 或 "components/button.jsx"
  defaultExpanded?: boolean; // 默认是否展开编辑器
  readOnly?: boolean; // 是否为只读模式，使用 SandpackCodeViewer
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

export type DeviceType = 'iphone' | 'android' | 'iphone-14' | 'samsung-s8';

export interface AdvThemeConfig extends /* @vue-ignore */ DefaultTheme.Config {
  changelog?: IChangelog;
  coverage?: ICoverage;
  customPagePath?: string;
  exampleDir?: string; // 示例文件的目录路径（相对于 public 目录，默认 '/example/'）
}
