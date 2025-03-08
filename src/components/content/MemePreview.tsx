
import { Card } from "@/components/ui/card";

interface MemePreviewProps {
  imageUrl: string;
  text: string;
}

export function MemePreview({ imageUrl, text }: MemePreviewProps) {
  return (
    <Card className="overflow-hidden max-w-md mx-auto">
      <div className="relative">
        <img src={imageUrl} alt="Generated meme" className="w-full h-auto" />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-4 text-center font-bold text-xl">
          {text}
        </div>
      </div>
    </Card>
  );
}
