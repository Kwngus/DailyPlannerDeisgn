export type Category = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
};

export type Event = {
  id: string;
  user_id: string;
  category_id: string | null;
  category?: Category;
  title: string;
  note: string | null;
  date: string; // 'YYYY-MM-DD'
  start_min: number; // 예: 540 = 09:00
  end_min: number; // 예: 600 = 10:00
  is_note: boolean;
  created_at: string;
};

export type ViewMode = "day" | "week" | "month";

export type Priority = "high" | "medium" | "low";

export type Todo = {
  id: string;
  user_id: string;
  category_id: string | null;
  category?: Category;
  title: string;
  memo: string | null;
  due_date: string | null; // 'YYYY-MM-DD'
  priority: Priority;
  is_done: boolean;
  created_at: string;
};