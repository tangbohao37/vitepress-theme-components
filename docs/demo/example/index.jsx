import { Button, Space } from '@arco-design/web-react';

const Example = () => {
  return (
    <div>
      <Space size="large">
        <Button type="primary">Primary</Button>
        <Button type="secondary">Secondary</Button>
        <Button type="dashed">Dashed</Button>
        <Button type="outline">Outline</Button>
        <Button type="text">Text</Button>
        <Button type="primary">Primary</Button>
        <Button type="secondary">Secondary</Button>
        <Button type="dashed">Dashed</Button>
        <Button type="outline">Outline</Button>
        <Button type="text">Text</Button>
      </Space>
    </div>
  );
};

render(<Example />);
