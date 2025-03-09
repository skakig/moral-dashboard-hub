
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MemeForm } from "./meme-generator/MemeForm";
import { SavedMemes } from "./meme-generator/SavedMemes";
import { useMemeStorage, useMemeGeneration, useMemeActions } from "@/hooks/memes";
import { MemeFormData } from "@/types/meme";
import { toast } from "sonner";

export function MemeGenerator() {
  const [formData, setFormData] = useState<MemeFormData>({
    prompt: "",
    topText: "",
    bottomText: "",
    platform: "twitter"
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Using modular hooks
  const { isGenerating, generateMemeImage } = useMemeGeneration();
  const { isSaving, savedMemes, isLoading, saveMeme, fetchMemes, deleteMeme } = useMemeStorage();
  const { downloadMeme, shareMeme } = useMemeActions();

  useEffect(() => {
    fetchMemes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlatformChange = (value: string) => {
    setFormData((prev) => ({ ...prev, platform: value }));
  };

  const handleGenerate = async () => {
    if (!formData.prompt) {
      toast.error("Please enter a prompt for your meme");
      return;
    }
    
    const image = await generateMemeImage(formData.prompt, formData.platform);
    
    if (image) {
      setFormData((prev) => ({ ...prev, imageUrl: image }));
    }
  };
  
  const handleSave = async () => {
    if (editMode && editId) {
      // TODO: Add edit functionality when API is ready
      toast.success("Meme updated successfully");
      setEditMode(false);
      setEditId(null);
    } else {
      await saveMeme(formData);
    }
  };
  
  const handleDownload = () => {
    if (formData.imageUrl) {
      downloadMeme(formData.imageUrl, formData.topText, formData.bottomText);
    }
  };

  const handleShare = () => {
    if (!formData.imageUrl) {
      toast.error("Generate a meme first before sharing");
      return;
    }
    
    if (!formData.platform) {
      toast.error("Please select a platform for sharing");
      return;
    }
    
    // Build share text from the meme text
    const shareText = `${formData.topText} ${formData.bottomText}`.trim();
    
    shareMeme(
      formData.platform, 
      formData.imageUrl, 
      shareText, 
      {
        redirectUrl: "https://themh.io",
        tags: ["TheMoralHierarchy", "TMH", formData.platform]
      }
    );
  };

  const handleReset = () => {
    setFormData({
      prompt: "",
      topText: "",
      bottomText: "",
      platform: formData.platform, // Keep the selected platform
      imageUrl: undefined
    });
    setEditMode(false);
    setEditId(null);
  };
  
  const handleEditMeme = (meme: any) => {
    setFormData({
      prompt: meme.prompt,
      topText: meme.topText,
      bottomText: meme.bottomText,
      imageUrl: meme.imageUrl,
      platform: meme.platform || "twitter"
    });
    setEditMode(true);
    setEditId(meme.id);
  };

  const handleShareSaved = (meme: any) => {
    const text = `${meme.topText} ${meme.bottomText}`.trim();
    shareMeme(
      meme.platform || 'twitter', 
      meme.imageUrl, 
      text, 
      {
        redirectUrl: "https://themh.io",
        tags: ["TheMoralHierarchy", "TMH", meme.platform]
      }
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{editMode ? "Edit Meme" : "Generate New Meme"}</CardTitle>
        </CardHeader>
        <CardContent>
          <MemeForm
            formData={formData}
            isGenerating={isGenerating}
            isSaving={isSaving}
            editMode={editMode}
            handleInputChange={handleInputChange}
            handlePlatformChange={handlePlatformChange}
            handleGenerate={handleGenerate}
            handleSave={handleSave}
            handleDownload={handleDownload}
            handleShare={handleShare}
            handleReset={handleReset}
          />
        </CardContent>
      </Card>
      
      <SavedMemes
        memes={savedMemes} 
        isLoading={isLoading} 
        onEdit={handleEditMeme} 
        onDelete={deleteMeme} 
        onShare={handleShareSaved}
      />
    </div>
  );
}
