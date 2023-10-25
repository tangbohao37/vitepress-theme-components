import { FC } from 'react';
import * as docgen from 'react-docgen-typescript';

interface IApiTableProps {
  path: string;
}

export const ApiTable: FC<IApiTableProps> = () => {
  const res = docgen.parse('../../docs/demo/example/index.tsx', {
    savePropValueAsString: true
  });
  console.log(res);
  return <>123121</>;
};
