import { FC } from "react";
import Skeleton from "react-loading-skeleton";

const loading: FC = () => {
  return (
    <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]">
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="relative flex items-center space-x-4">
          <div className="relative">
            \{/* Skeleton for Profile Image */}
            <div className="w-8 sm:w-12 h-7 sm:h-12 bg-gray-300 animate-pulse rounded-full"></div>
          </div>
          <div className="flex flex-col leading-tight">
            {/* Skeleton for Name */}
            <div className="text-xl flex items-center">
              <div className="w-24 bg-gray-300 animate-pulse h-6 rounded"></div>
            </div>
            {/* Skeleton for Email */}
            <div className="w-32 bg-gray-300 animate-pulse h-4 rounded mt-1"></div>
          </div>
        </div>
        {/* Skeleton for Remove Friend Button */}
        <div className="px-4 py-2 bg-gray-300 animate-pulse rounded w-32 h-10 mt-2"></div>
      </div>

      {/* Skeleton for Messages */}
      <div className="animate-pulse space-y-4 flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto">
        <div className="w-48 h-16 bg-gray-300 rounded"></div>
        <div className="w-64 h-16 bg-gray-300 rounded"></div>
        <div className="w-72 h-16 bg-gray-300 rounded"></div>
      </div>

      {/* Skeleton for Chat Input */}
      <div className="w-full bg-gray-300 animate-pulse h-12 rounded mt-4"></div>
    </div>
  );
};

export default loading;
