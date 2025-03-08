
/**
 * Maps service names to their appropriate validator
 * @param serviceName The service name to map
 * @returns The validator type for the service
 */
export function getValidatorForService(serviceName: string): string {
  const serviceNameLower = serviceName.toLowerCase();
  
  if (serviceNameLower.includes("openai")) return "openai";
  if (serviceNameLower.includes("elevenlabs")) return "elevenlabs";
  if (serviceNameLower.includes("stable") && serviceNameLower.includes("diffusion")) return "stableDiffusion";
  if (serviceNameLower.includes("runway")) return "runway";
  if (serviceNameLower.includes("pika")) return "pika";
  if (serviceNameLower.includes("meta") || serviceNameLower.includes("facebook") || serviceNameLower.includes("instagram")) return "meta";
  if (serviceNameLower.includes("tiktok")) return "tiktok";
  if (serviceNameLower.includes("youtube") || serviceNameLower.includes("google")) return "google";
  if (serviceNameLower.includes("twitter") || serviceNameLower.includes("x")) return "twitter";
  
  return "generic";
}
