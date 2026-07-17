import React from 'react';
import Lottie from 'lottie-react';
import NoDataAnimation from '../../assets/lottie/NoData.json';

interface NoDataScreenProps {
  message?: string;
}

export const NoDataScreen: React.FC<NoDataScreenProps> = ({ message = 'No data available' }) => {
  const LottieComponent = Lottie && (Lottie as any).default ? (Lottie as any).default : Lottie;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[300px] p-8 text-gray-500">
      <div className="w-80 h-80 mb-4">
        <LottieComponent animationData={NoDataAnimation} loop={true} />
      </div>
      {message && <p className="text-sm font-medium">{message}</p>}
    </div>
  );
};
