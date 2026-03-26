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
  date: string;
  start_min: number;
  end_min: number;
  is_note: boolean;
  is_allday: boolean;
  recurrence_type: RecurrenceType;
  recurrence_end_date: string | null;
  recurrence_group_id: string | null;
  created_at: string;
};

export type ViewMode = "day" | "week" | "month";

export type Priority = "high" | "medium" | "low";

export type RecurrenceType = "none" | "daily" | "weekly" | "monthly";

export type Todo = {
  id: string;
  user_id: string;
  category_id: string | null;
  category?: Category;
  title: string;
  memo: string | null;
  due_date: string | null;
  priority: Priority;
  is_done: boolean;
  sort_order: number;
  created_at: string;
};