import { useEffect } from 'react';

const Example = () => {
  useEffect(() => {
    console.log('Example Render');
  }, []);

  return (
    <div>
      <h1> This is a example </h1>
    </div>
  );
};

render(<Example />);
