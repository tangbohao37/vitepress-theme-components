import React, { FC } from 'react';

interface IProps {
  /**
   * @default abcdfsdf
   * path
   * @deprecated 请使用 path2
   */
  path: string;
  /**
   * obj obj
   */
  obj: Record<'aaa' | 'bb', string>;
}
export const Comp: FC<IProps> = () => {
  return <p>123123</p>;
};
