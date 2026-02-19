"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || "Unknown error" };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="container" style={{ marginTop: 14 }}>
            <div className="errorBox">
              <div style={{ fontWeight: 700 }}>Something went wrong</div>
              <div className="small" style={{ marginTop: 6 }}>
                {this.state.message}
              </div>
              <button
                className="btn"
                style={{ marginTop: 12 }}
                onClick={() => {
                  this.setState({ hasError: false, message: "" });
                  window.location.reload();
                }}
              >
                Reload page
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
