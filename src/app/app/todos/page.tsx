import TodoPanel from "@/components/todos/TodoPanel";
import DDayPanel from "@/components/ddays/DDayPanel";

export default function TodosPage() {
  return (
    <div className="h-[calc(100vh-56px)] p-3 flex flex-col gap-3 overflow-y-auto">
      <DDayPanel />
      <div className="flex-1 min-h-0">
        <TodoPanel />
      </div>
    </div>
  );
}
