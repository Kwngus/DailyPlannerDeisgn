"use client";

import { Component, ReactNode } from "react";
import { RefreshCw } from "lucide-react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="flex flex-col items-center justify-center h-40 gap-3 rounded-xl border"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            이 섹션을 불러오는 데 실패했어요
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                       bg-[#1A1714] text-white hover:bg-[#3D3430] transition-colors"
          >
            <RefreshCw size={12} />
            다시 시도
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
