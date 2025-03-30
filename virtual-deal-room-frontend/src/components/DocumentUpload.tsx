"use client";

import { useState, useEffect, useRef } from "react";
import { uploadDocument, getDocuments } from "../app/lib/api";
import { Deal } from "../app/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/app/context/AuthContext";

interface DocumentUploadProps {
  dealId: string;
}

type Document = Deal["documents"][number];

export default function DocumentUpload({ dealId }: DocumentUploadProps) {
    const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [access, setAccess] = useState<"buyer" | "seller" | "both">("both");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      const { data } = await getDocuments(dealId);
      setDocuments(data.data);
    };
    fetchDocuments();
  }, [dealId]);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    const formData = new FormData();
    formData.append("document", file);
    formData.append("access", access);
    try {
      await uploadDocument(dealId, formData);
      setFile(null);
      setAccess("both");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      const { data } = await getDocuments(dealId);
      setDocuments(data.data);
      toast.success("Document uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload document" + error);
    }
  };

  return (
    <Card className="mt-4 animate-fade-in">
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
        {user?.role === 'buyer' && (
          <div className="flex space-x-2">
            <Input
              type="file"
              accept=".pdf,.docx,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <Select
              onValueChange={(value: "buyer" | "seller" | "both") =>
                setAccess(value)
              }
              value={access}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buyer">Buyer Only</SelectItem>
                <SelectItem value="seller">Seller Only</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
            <Button className="cursor-pointer" onClick={handleUpload} disabled={!file}>
              Upload
            </Button>
          </div>
            )}
          <Separator />
          <div>
            {documents.length === 0 ? (
              <p>No documents available</p>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.publicId}
                  className="flex items-center justify-between"
                >
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                  >
                    {doc.publicId.split("/").pop()}
                  </a>
                  <span className="text-sm text-gray-500">
                    Uploaded by: {doc.uploadedBy}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
