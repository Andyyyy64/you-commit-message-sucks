import React from 'react';

type Props = {
  css: string;
  text: string;
}

const Loading: React.FC<Props> = ({ css, text }) => {
  return (
      <div className={`flex items-center justify-center absolute ${css}`}>
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      <p className="ml-2">{text}</p>
    </div>
  );
};

export default Loading;