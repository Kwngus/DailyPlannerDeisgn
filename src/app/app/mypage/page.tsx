import { createServerSupabaseClient } from "@/lib/supabaseServer";
import MypageClient from "./MypageClient";

export default async function MyPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const [eventsRes, todosRes, heatmapRes] = await Promise.all([
    supabase
      .from("events")
      .select("id, date, category_id, category:categories(name, color)")
      .gte("date", weekAgo.toISOString().slice(0, 10))
      .eq("user_id", user?.id ?? ""),
    supabase
      .from("todos")
      .select("id, is_done, category_id")
      .eq("user_id", user?.id ?? ""),
    supabase
      .from("events")
      .select("date")
      .gte(
        "date",
        new Date(today.getTime() - 83 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
      )
      .eq("user_id", user?.id ?? ""),
  ]);

  return (
    <MypageClient
      user={user}
      weekEvents={eventsRes.data ?? []}
      todos={todosRes.data ?? []}
      heatmapDates={(heatmapRes.data ?? []).map((e) => e.date)}
    />
  );
}
