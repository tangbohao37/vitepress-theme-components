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
      </Space>
      <input type="text" placeholder="121332" maxLength={10} />
      <div style={{ height: 1000 }}>
        <p>1231</p>
      </div>
    </div>
  );
};

render(<Example />);
