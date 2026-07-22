import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-red-600 text-2xl font-bold">!</span>
            </div>
            <h1 className="text-xl font-semibold text-zinc-900">Algo salió mal</h1>
            <p className="text-sm text-zinc-500 max-w-md">
              Ocurrió un error inesperado. Recarga la página e intenta de nuevo.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-black transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}