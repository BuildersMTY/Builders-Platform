"use client";

import { Component, type ReactNode } from "react";
import Link from "next/link";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

export class WorkspaceErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <div className="max-w-md text-center px-6">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center border border-error/40 bg-error/5">
            <span className="font-mono text-lg text-error">!</span>
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-text">
            Algo salió mal
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Tu código está seguro. Esto es un error de la plataforma.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
            >
              Recargar
            </button>
            <Link
              href="/courses"
              className="text-sm text-text-muted hover:text-text transition-colors"
            >
              Ir al inicio
            </Link>
          </div>

          {this.state.error && (
            <button
              onClick={() =>
                this.setState({ showDetails: !this.state.showDetails })
              }
              className="mt-4 text-xs text-text-dim hover:text-text-muted transition-colors"
            >
              {this.state.showDetails
                ? "Ocultar detalles"
                : "Ver detalles del error"}
            </button>
          )}

          {this.state.showDetails && this.state.error && (
            <pre className="mt-3 max-h-32 overflow-auto border border-border bg-surface p-3 text-left text-[10px] text-text-dim font-mono">
              {this.state.error.message}
              {"\n"}
              {this.state.error.stack}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
