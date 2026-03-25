import { createServerSupabaseClient } from "@/lib/supabaseServer";

export default async function MyPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h2 className="font-serif text-2xl mb-6">마이페이지</h2>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div className="w-16 h-16 bg-[#1A1714] rounded-full flex items-center justify-center mx-auto">
          <span className="text-white text-2xl font-serif">
            {user?.email?.[0].toUpperCase() ?? "?"}
          </span>
        </div>
        <p className="text-center text-sm text-gray-500">{user?.email}</p>
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-400 text-center">
            가입일:{" "}
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString("ko-KR")
              : "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
