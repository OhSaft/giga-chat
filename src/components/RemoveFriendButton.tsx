"use client";

import { FC, useState } from "react";
import toast from "react-hot-toast";

interface RemoveFriendButtonProps {
  friendId: string; // The ID of the friend to be removed
}

const RemoveFriendButton: FC<RemoveFriendButtonProps> = ({ friendId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state to open/close
  const [isLoading, setIsLoading] = useState(false); // Loading state for button

  // Function to handle the remove friend action
  const handleRemoveFriend = async () => {
    setIsLoading(true); // Start loading

    try {
      // Make the API request to remove the friend
      const response = await fetch(`/api/friends/remove`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendId }),
      });

      // Handle different response statuses
      if (response.ok) {
        toast("Friend removed successfully.");
        window.location.href = "/dashboard"; // Redirect to friends page
      } else {
        toast("Failed to remove friend.");
      }
    } catch (error) {
      console.error("Failed to remove friend:", error);
      toast("An error occurred while removing the friend.");
    } finally {
      setIsLoading(false); // End loading
      setIsModalOpen(false); // Close the modal after the action
    }
  };

  return (
    <div>
      {/* Remove Friend Button */}
      <button
        onClick={() => setIsModalOpen(true)} // Open the modal on button click
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Remove Friend
      </button>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-lg font-semibold">
              Are you sure you want to remove this friend?
            </h2>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)} // Close modal without action
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveFriend} // Confirm remove friend action
                disabled={isLoading} // Disable button while loading
                className={`px-4 py-2 rounded ${
                  isLoading ? "bg-gray-500" : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {isLoading ? "Removing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemoveFriendButton;
