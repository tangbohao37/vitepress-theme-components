import React, { FC } from 'react';


/**
 * 测试类型
 */
type Test = {
  /**
   * 测试属性 aaaa
   * @default 0
   */
  aaaa: number
}

/**
 * 测试类型2
 */
interface Test2 {
  /**
   * cccc 描述
   */
  ccccc: Record<'aaa' | 'bbbb', string>
}

interface ILoadingProps extends Test2 {
  /**
   * 背景图
   * @default null
   */
  loadingBgImg?: string
  /**
   * 测试属性
   * @default 0
   */
  testProps: {
    number: number
    otherType: Test
  }
}
export const Comp: FC<ILoadingProps> = () => {
  return <p>123123</p>;
};
