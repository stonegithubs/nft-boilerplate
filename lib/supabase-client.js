import { createClient } from "@supabase/supabase-js";

export const sup = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);
