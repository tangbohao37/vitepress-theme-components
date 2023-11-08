import React, { FC } from 'react';

/**
 * 测试类型2
 */
interface ExtendProps {
  /**
   * cccc 描述
   */
  extendProps: Record<'aaa' | 'bbbb', string>;
}

interface ILoadingProps extends ExtendProps {
  /**
   * 背景图
   * @default null
   */
  background?: string;
  /**
   * 测试属性
   * @default 0
   */
  testProps?: {
    number: number;
    otherType: string;
  };
}
export const Comp: FC<ILoadingProps> = () => {
  return <p>123123</p>;
};
