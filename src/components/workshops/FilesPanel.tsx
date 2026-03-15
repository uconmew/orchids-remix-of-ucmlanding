"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, Upload, Download, Trash2, Image, Video, File } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WorkshopFile {
  id: number;
  workshopId: number;
  fileName: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  uploadedBy: string;
  uploadedAt: string;
}

interface FilesPanelProps {
  workshopId: string;
  currentUserId: string;
  isHost: boolean;
}

export function FilesPanel({ workshopId, currentUserId, isHost }: FilesPanelProps) {
  const [files, setFiles] = useState<WorkshopFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Upload state
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState<string>("document");

  useEffect(() => {
    fetchFiles();
  }, [workshopId]);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/workshops/${workshopId}/files`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!fileName.trim() || !fileUrl.trim()) {
      toast.error("Please provide file name and URL");
      return;
    }

    try {
      setIsUploading(true);

      const response = await fetch(`/api/workshops/${workshopId}/files`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
        body: JSON.stringify({
          fileName: fileName.trim(),
          fileUrl: fileUrl.trim(),
          fileType,
        }),
      });

      if (response.ok) {
        toast.success("File uploaded successfully!");
        setShowUploadDialog(false);
        setFileName("");
        setFileUrl("");
        setFileType("document");
        fetchFiles();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileId: number) => {
    try {
      const response = await fetch(
        `/api/workshops/${workshopId}/files?fileId=${fileId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
          },
        }
      );

      if (response.ok) {
        toast.success("File deleted");
        fetchFiles();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Error deleting file");
    }
  };

  const getFileIcon = (fileType: string | null) => {
    switch (fileType) {
      case "image":
        return <Image className="w-4 h-4 text-blue-400" />;
      case "video":
        return <Video className="w-4 h-4 text-purple-400" />;
      case "document":
        return <FileText className="w-4 h-4 text-green-400" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <Card className="bg-gray-900 border-gray-800 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Files ({files.length})
          </CardTitle>
          {isHost && (
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Upload className="w-4 h-4 mr-1" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800 text-white">
                <DialogHeader>
                  <DialogTitle>Upload File</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">File Name</label>
                    <Input
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="presentation.pdf"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">File URL</label>
                    <Input
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      placeholder="https://example.com/file.pdf"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">File Type</label>
                    <select
                      value={fileType}
                      onChange={(e) => setFileType(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                    >
                      <option value="document">Document</option>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full bg-[#A92FFA] hover:bg-[#A92FFA]/90"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload File
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-4">
        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No files uploaded yet
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <Card key={file.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.fileType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {file.fileName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          {file.fileSize && <span>{formatFileSize(file.fileSize)}</span>}
                          <span>•</span>
                          <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(file.fileUrl, "_blank")}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        {isHost && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(file.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
