-- Create execute_query function for temporary use until types are updated
CREATE OR REPLACE FUNCTION public.execute_query(query_text TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result JSON;
BEGIN
  -- Only allow SELECT queries for safety
  IF LOWER(TRIM(query_text)) NOT LIKE 'select%' THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed';
  END IF;

  -- Execute the query and return as JSON
  EXECUTE 'SELECT array_to_json(array_agg(row_to_json(t))) FROM (' || query_text || ') t' INTO result;
  
  RETURN COALESCE(result, '[]'::JSON);
END;
$$;

-- Grant permission to execute this function
GRANT EXECUTE ON FUNCTION public.execute_query(TEXT) TO authenticated;