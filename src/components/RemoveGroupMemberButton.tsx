"use client";

import { UserMinus } from "lucide-react";
import { FC, useState } from "react";
import toast from "react-hot-toast";

interface RemoveGroupMemberButtonProps {
  groupId: string; // The ID of the group
  userToRemove: User;  // The user to be removed
  onRemoveSuccess: () => void;  // Callback when the member is successfully removed
}

const RemoveGroupMemberButton: FC<RemoveGroupMemberButtonProps> = ({
  groupId,
  userToRemove,
  onRemoveSuccess,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [isLoading, setIsLoading] = useState(false); // Loading state for button

  // Function to handle the remove member action
  const handleRemoveMember = async () => {
    setIsLoading(true);

    const memberId = userToRemove.id;

    try {
      // Make the API request to remove the member
      const response = await fetch("/api/groups/remove", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId, memberId }),
      });
      

      if (response.ok) {
        toast("Member removed successfully.");
        onRemoveSuccess(); // Callback to refresh or update the UI
      } else {
        toast("Failed to remove member.");
      }
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast("An error occurred while removing the member.");
    } finally {
      setIsLoading(false);
      setIsModalOpen(false); // Close the modal after the action
    }
  };

  return (
    <div>
      {/* Remove Member Button */}
      <button
        onClick={() => setIsModalOpen(true)} // Open the modal on button click
        className="p-2 hover:bg-gray-100 rounded-md text-red-600"
      >
        <UserMinus className="h-4 w-4" />
      </button>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-lg font-semibold">
              Are you sure you want to remove {userToRemove.name} from the group?
            </h2>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)} // Close modal without action
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveMember} // Confirm removal
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

export default RemoveGroupMemberButton;
