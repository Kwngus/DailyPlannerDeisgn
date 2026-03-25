import { useToastStore } from "@/store/toastStore";

type SupabaseError = {
  message: string;
  code?: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  PGRST116: "데이터를 찾을 수 없어요.",
  "23505": "이미 존재하는 데이터예요.",
  "23503": "참조된 데이터가 없어요.",
  "42501": "권한이 없어요.",
  "JWT expired": "로그인이 만료됐어요. 다시 로그인해주세요.",
};

export function getErrorMessage(error: SupabaseError): string {
  if (!error) return "알 수 없는 오류가 발생했어요.";

  // 알려진 에러 코드
  for (const [key, msg] of Object.entries(ERROR_MESSAGES)) {
    if (error.code === key || error.message?.includes(key)) {
      return msg;
    }
  }

  return error.message || "알 수 없는 오류가 발생했어요.";
}

// 훅 밖에서 쓸 수 있는 토스트 에러 표시
export function showError(message: string) {
  useToastStore.getState().show(message, "error");
}
