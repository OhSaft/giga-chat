import { FC } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const loading: FC = () => {
  return (
    <main className="pt-8">
      <div className="w-48 bg-gray-300 animate-pulse h-8 mb-8 rounded"></div>
      <div className="max-w-sm">
        <div className="w-56 bg-gray-300 animate-pulse h-6 rounded mb-4"></div>
        <div className="mt-2 flex gap-4">
          <div className="w-full bg-gray-300 animate-pulse h-10 rounded-md"></div>
          <div className="w-20 bg-gray-300 animate-pulse h-10 rounded"></div>
        </div>
      </div>
    </main>
  );
};

export default loading;
