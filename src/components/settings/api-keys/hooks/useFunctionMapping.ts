
import { useState } from 'react';

interface UseFunctionMappingProps {
  onSuccess?: () => void;
}

export function useFunctionMapping({ onSuccess }: UseFunctionMappingProps) {
  const [isAddMappingOpen, setIsAddMappingOpen] = useState(false);

  return {
    isAddMappingOpen,
    setIsAddMappingOpen
  };
}
