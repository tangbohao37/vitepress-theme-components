import * as React from 'react';
import { FC, useMemo } from 'react';
import { LiveError, LivePreview, LiveProvider } from 'react-live';
import { importRegex } from '../constant';
import './react-live.css';

export interface IReactLive {
  sourceCode?: string;
  scope?: Record<string, any>;
  noStyle?: boolean;
}

export const ReactLive: FC<IReactLive> = ({
  sourceCode,
  scope,
  noStyle = false
}) => {
  const demoLogicCode = useMemo(() => {
    return sourceCode?.replace(importRegex, '').trim();
  }, [sourceCode]);

  return (
    <div className="react-live-comp-wrapper">
      <LiveProvider code={demoLogicCode} scope={scope} noInline>
        <div className={noStyle ? '' : 'react-live-comp-demo-wrapper'}>
          <LivePreview />
          <LiveError />
        </div>
      </LiveProvider>
    </div>
  );
};
