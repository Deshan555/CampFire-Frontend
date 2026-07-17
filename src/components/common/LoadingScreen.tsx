import React from 'react';
import Lottie from 'lottie-react';
import LoadingAnimation from '../../assets/lottie/Loading.json';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
  console.log('Lottie component:', Lottie);
  console.log('Animation:', LoadingAnimation);
  
  // Handle case where Vite wraps the default export
  const LottieComponent = Lottie && (Lottie as any).default ? (Lottie as any).default : Lottie;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[200px] p-8 text-gray-500">
      <div className="w-64 h-64 mb-4">
        <LottieComponent animationData={LoadingAnimation} loop={true} />
      </div>
      {message && <p className="text-sm font-medium">{message}</p>}
    </div>
  );
};
