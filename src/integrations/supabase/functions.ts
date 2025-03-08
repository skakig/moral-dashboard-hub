
import { supabase } from "./client";

/**
 * Fetches enum values from Postgres database
 * @param enumName The name of the enum to fetch values for
 * @returns Array of enum values or empty array on error
 */
export async function getEnumValues(enumName: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.rpc('get_enum_values', { enum_name: enumName });
    
    if (error) {
      console.error(`Error fetching enum values for ${enumName}:`, error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error(`Exception fetching enum values for ${enumName}:`, error);
    return [];
  }
}

/**
 * Helper to create a database function that can expose enum values
 */
export async function createEnumFunction() {
  const { error } = await supabase.rpc('create_enum_function');
  
  if (error) {
    console.error('Error creating enum function:', error);
    return false;
  }
  
  return true;
}

// Additional database utility functions can be added here
