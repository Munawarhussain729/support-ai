"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const formSchema = z.object({
  clientName: z.string().min(1, "Name is required"),
  clientEmail: z.string().email("Invalid email address"),
  clientPhone: z.string().optional(),
  category: z.enum(["bug", "request", "suggestion", "other"], {
    message: "Please select a category",
  }),
  message: z.string().min(10, "Message must be at least 10 characters"),
  video: z.instanceof(File).optional(),
  screenshots: z.array(z.instanceof(File)).optional(),
});

type FormData = z.infer<typeof formSchema>;

function SupportPageContent() {
  const router = useRouter();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const category = watch("category");

  // Fetch user details from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setValue("clientName", user.name || "");
        setValue("clientEmail", user.email || "");
        setValue("clientPhone", user.phone || "");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    setIsLoading(false);
  }, [setValue]);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "video/mp4" || file.type === "video/quicktime") {
        setVideoFile(file);
        setValue("video", file);
      } else {
        alert("Please upload an MP4 or MOV video file");
      }
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    setScreenshotFiles((prev) => [...prev, ...imageFiles]);
    setValue("screenshots", [...screenshotFiles, ...imageFiles]);
  };

  const removeScreenshot = (index: number) => {
    const newFiles = screenshotFiles.filter((_, i) => i !== index);
    setScreenshotFiles(newFiles);
    setValue("screenshots", newFiles);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("clientName", data.clientName);
      formData.append("clientEmail", data.clientEmail);
      formData.append("clientPhone", data.clientPhone || "");
      formData.append("category", data.category);
      formData.append("message", data.message);

      if (videoFile) {
        formData.append("video", videoFile);
      }

      screenshotFiles.forEach((file) => {
        formData.append("screenshots", file);
      });

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("/api/support", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit ticket");
      }

      const result = await response.json();
      router.push(`/ticket-submitted/${result.ticketId}`);
    } catch (error) {
      console.error("Error submitting ticket:", error);
      alert(error instanceof Error ? error.message : "Failed to submit ticket");
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    // biome-ignore lint/correctness/noUnusedVariables: bg-gradient-to-br is correct Tailwind syntax
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Submit a Support Ticket
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Fill out the form below and we'll get back to you as soon as
            possible.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          {/* Client Name */}
          <div className="space-y-2">
            <Label htmlFor="clientName">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="clientName"
              {...register("clientName")}
              placeholder="John Doe"
              disabled={isSubmitting}
              className="transition-all focus:ring-2 focus:ring-blue-500"
            />
            {errors.clientName && (
              <p className="text-sm text-destructive">
                {errors.clientName.message}
              </p>
            )}
          </div>

          {/* Client Email */}
          <div className="space-y-2">
            <Label htmlFor="clientEmail">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="clientEmail"
              type="email"
              {...register("clientEmail")}
              placeholder="john@example.com"
              disabled={isSubmitting}
              className="transition-all focus:ring-2 focus:ring-blue-500"
            />
            {errors.clientEmail && (
              <p className="text-sm text-destructive">
                {errors.clientEmail.message}
              </p>
            )}
          </div>

          {/* Client Phone */}
          <div className="space-y-2">
            <Label htmlFor="clientPhone">Phone</Label>
            <Input
              id="clientPhone"
              type="tel"
              {...register("clientPhone")}
              placeholder="+1 (555) 123-4567"
              disabled={isSubmitting}
              className="transition-all focus:ring-2 focus:ring-blue-500"
            />
            {errors.clientPhone && (
              <p className="text-sm text-destructive">
                {errors.clientPhone.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={category}
              onValueChange={(value) => setValue("category", value as "bug" | "request" | "suggestion" | "other")}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="request">Feature Request</SelectItem>
                <SelectItem value="suggestion">Suggestion</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              {...register("message")}
              placeholder="Describe your issue or request..."
              rows={6}
            />
            {errors.message && (
              <p className="text-sm text-destructive">
                {errors.message.message}
              </p>
            )}
          </div>

          {/* Video Upload */}
          <div className="space-y-2">
            <Label htmlFor="video">Video (MP4 or MOV)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="video"
                type="file"
                accept="video/mp4,video/quicktime"
                onChange={handleVideoChange}
                disabled={isSubmitting}
              />
              {videoFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{videoFile.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoFile(null);
                      setValue("video", undefined);
                    }}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Screenshot Upload */}
          <div className="space-y-2">
            <Label htmlFor="screenshots">Screenshots</Label>
            <Input
              id="screenshots"
              type="file"
              accept="image/*"
              multiple
              onChange={handleScreenshotChange}
              disabled={isSubmitting}
            />
            {screenshotFiles.length > 0 && (
              <div className="mt-2 space-y-2">
                {screenshotFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-2 rounded-md border p-2 text-sm"
                  >
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 text-muted-foreground">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeScreenshot(index)}
                      className="text-destructive hover:text-destructive/80"
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isSubmitting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Ticket"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <ProtectedRoute allowedRoles={["client"]}>
      <SupportPageContent />
    </ProtectedRoute>
  );
}
