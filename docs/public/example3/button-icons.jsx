import { Button, Space } from '@arco-design/web-react';
import { IconPlus, IconDelete } from '@arco-design/web-react/icon';
import '@arco-design/web-react/dist/css/arco.css';

export default function Example() {
  return (
    <Space size="large">
      <Button type="primary" icon={<IconPlus />} />
      <Button type="primary" icon={<IconDelete />}>
        Delete
      </Button>
      <Button type="primary" icon={<IconPlus />} />
      <Button shape="circle" type="primary" icon={<IconPlus />} />
      <Button shape="round" type="primary">
        Primary
      </Button>
      <Button type="primary">Primary</Button>
    </Space>
  );
};

