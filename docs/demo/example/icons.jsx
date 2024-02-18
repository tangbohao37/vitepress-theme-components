import * as Icons from '@arco-design/web-react/icon';
import { Message } from '@arco-design/web-react';
import './example/index.css';

const Demo = () => {
  const msg = (str) => {
    navigator.clipboard.writeText(`<${str} />`);
    Message.info(`<${str}/>  copied !`);
  };

  return (
    <div className="example-wrapper">
      {Object.keys(Icons).map((key) => {
        const Icon = Icons[key];
        return (
          <div
            className="example-wrapper-item"
            key={key}
            onClick={() => msg(key)}
          >
            <div className="example-wrapper-item-icon">
              <Icon />
            </div>
            <p>{key}</p>
          </div>
        );
      })}
    </div>
  );
};

render(<Demo />);
