import { supabase } from "@/integrations/supabase/client";

export interface FunctionMapping {
  id: string;
  function_name: string;
  preferred_service: string;
  fallback_service: string | null;
  description: string | null;
  updated_at: string;
}

/**
 * Function Mapping Service
 * 
 * This service manages API function mappings, which determine which
 * service (like OpenAI, Anthropic, etc.) is used for specific API functions.
 * 
 * For example, we might want to use OpenAI for generating article content
 * but Anthropic for generating more sensitive content related to morality.
 */

/**
 * Get all function mappings
 */
export async function getFunctionMappings() {
  try {
    const { data, error } = await supabase
      .from('api_function_mapping')
      .select('*')
      .order('function_name');
    
    if (error) throw error;
    return data as FunctionMapping[];
  } catch (error: any) {
    console.error("Error fetching function mappings:", error);
    return [];
  }
}

/**
 * Update a function mapping
 */
export async function updateFunctionMapping(mapping: {
  id?: string;
  function_name: string;
  preferred_service: string;
  fallback_service?: string | null;
  description?: string | null;
}) {
  try {
    // If we have an ID, update the existing record
    if (mapping.id) {
      const { data, error } = await supabase
        .from('api_function_mapping')
        .update({
          preferred_service: mapping.preferred_service,
          fallback_service: mapping.fallback_service,
          description: mapping.description
        })
        .eq('id', mapping.id)
        .select();
      
      if (error) throw error;
      return data?.[0] as FunctionMapping;
    } 
    // Otherwise create a new mapping
    else {
      const { data, error } = await supabase
        .from('api_function_mapping')
        .insert([{
          function_name: mapping.function_name,
          preferred_service: mapping.preferred_service,
          fallback_service: mapping.fallback_service,
          description: mapping.description
        }])
        .select();
      
      if (error) throw error;
      return data?.[0] as FunctionMapping;
    }
  } catch (error: any) {
    console.error("Error updating function mapping:", error);
    throw error;
  }
}

/**
 * Delete a function mapping
 */
export async function deleteFunctionMapping(id: string) {
  try {
    const { error } = await supabase
      .from('api_function_mapping')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error("Error deleting function mapping:", error);
    return false;
  }
}

/**
 * Get the preferred service for a function
 */
export async function getPreferredServiceForFunction(functionName: string) {
  try {
    const { data, error } = await supabase
      .from('api_function_mapping')
      .select('preferred_service, fallback_service')
      .eq('function_name', functionName)
      .single();
    
    if (error) {
      // If the function isn't mapped, return a default service
      console.warn(`No mapping found for function: ${functionName}`);
      return {
        preferred_service: 'OpenAI', // Default to OpenAI
        fallback_service: null
      };
    }
    
    return data;
  } catch (error: any) {
    console.error(`Error getting preferred service for ${functionName}:`, error);
    return {
      preferred_service: 'OpenAI', // Default to OpenAI
      fallback_service: null
    };
  }
}
