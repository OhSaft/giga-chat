// pages/404.js
import Link from "next/link";

export default function Custom404() {

  return (
    <div className="w-full flex h-screen">

      <div className="max-h-screen container py-16 md:py-12 w-full flex items-center justify-center text-center">
        <div className="w-full md:w-1/2 bg-white p-8 shadow-lg rounded-lg">
          
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <svg
              className="h-40 w-30 border-indigo-600 border-4 rounded-b-full p-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 110.62 173.65"
              fill="#4f46e5"
            >
              <path d="M55.07,67.91v47.02h24.55l6.7,8.06v-10.52l24.3-27.54v42.76c-12.77,6.75-20.4,18.33-22.76,31.4-.28,1.57-.25,6.76-1.05,7.56-19.33,9.26-43.06,9.36-62.42.15C24.27,151.04,16.02,134.68,0,127.47v-42.54l24.8,27.99v10.08l6.2-8.06h13.14v-36.72H15.87v-10.3h39.2ZM45.65,146.72v-11.19h19.84v11.19l14.4-5.67c-.48-2.92.65-7.43-.14-10.12-.53-1.79-4.24-4.87-4.94-6.95l-38.87.32c-.42.28-4.93,6.52-5.07,7.07-.28,1.15-.34,8.23,0,9.22.17.51.49.68.92.96,1.41.9,10.43,4.42,12.35,4.97.51.15.96.29,1.51.21h0Z" />
              <path d="M110.62,69.25c-4.93-5.35-10.32-10.22-16.36-14.55,13.09-10.42,6.55-29.86-10.7-31.84-14.27,15.95-41.31,15.97-56.01.44-12.78,2.61-19.21,15.86-12.92,26.26.73,1.2,3.41,3.84,3.27,4.66l-9.23,6.52L0,69.71V19.33c30.81-25.83,79.39-25.56,110.61-.45v50.38h.01Z" />
              <polygon points="94.75 78.21 66.48 78.21 66.48 67.91 94.01 67.91 94.75 68.58 94.75 78.21" />
            </svg>
          </div>

          {/* 404 Message */}
          <h2 className="text-2xl font-bold text-gray-800">404 - Page Not Found</h2>
          <p className="text-sm text-gray-500 mt-4">Oops! Looks like the page you are looking for does not exist.</p>

          <div className="mt-8 flex justify-center">
            <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-md">
                Go Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
