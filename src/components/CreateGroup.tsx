"use client";

import { FC, useState } from "react";
import Button from "./ui/Button";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Updated validator to include optional description
const groupValidator = z.object({
  name: z.string().min(1, "Group name is required").max(30, "Group name too long"),
  description: z.string().max(100, "Description too long").optional(),
});

type FormData = z.infer<typeof groupValidator>;

const CreateGroupButton: FC = () => {
  const [showSuccessState, setShowSuccessState] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(groupValidator),
  });

  const createGroup = async (data: FormData) => {
    try {
      const validatedData = groupValidator.parse(data);
      await axios.post("/api/groups/create", {
        name: validatedData.name,
        description: validatedData.description,
      });
      setShowSuccessState(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError("name", { message: error.message });
        return;
      }
      if (error instanceof AxiosError) {
        setError("name", { message: error.response?.data });
        return;
      }
      setError("name", { message: "Something went wrong." });
    }
  };

  const onSubmit = (data: FormData) => {
    createGroup(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Create New Group
          </label>
          <div className="mt-2">
            <input
              {...register("name")}
              type="text"
              className="block w-full rounded-md border-0 py-1.5 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Group name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Description (optional)
          </label>
          <div className="mt-2">
            <textarea
              {...register("description")}
              rows={3}
              className="block w-full rounded-md border-0 py-1.5 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Group description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Button type="submit" className="w-full">
            Create Group
          </Button>
        </div>

        {showSuccessState && (
          <p className="text-sm text-green-600">Group created successfully!</p>
        )}
      </div>
    </form>
  );
};

export default CreateGroupButton;