
import { supabase } from "./client";

/**
 * Fetches enum values from Postgres database
 * @param enumName The name of the enum to fetch values for
 * @returns Array of enum values or empty array on error
 */
export async function getEnumValues(enumName: string): Promise<string[]> {
  try {
    // Try to query the enum values
    const { data, error } = await supabase
      .from('assessment_categories')
      .select('name');
    
    if (error) {
      console.error(`Error fetching enum values for ${enumName}:`, error);
      return [];
    }
    
    // Transform the data to match the expected format
    return data.map(item => item.name) || [];
  } catch (error) {
    console.error(`Exception fetching enum values for ${enumName}:`, error);
    return [];
  }
}

/**
 * Helper to create a database function that can expose enum values
 */
export async function createEnumFunction() {
  try {
    // Call the edge function instead of direct RPC
    const response = await fetch('/api/create-enum-function');
    
    if (!response.ok) {
      console.error('Error creating enum function:', await response.text());
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception creating enum function:', error);
    return false;
  }
}

// Additional database utility functions can be added here
