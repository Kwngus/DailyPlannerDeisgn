import { createServerSupabaseClient } from "@/lib/supabaseServer";
import SplashScreen from "@/components/ui/SplashScreen";

export default async function RootPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const destination = user ? "/app" : "/login";

  return <SplashScreen destination={destination} />;
}
