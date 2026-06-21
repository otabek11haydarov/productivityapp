import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

// Placeholder for layout
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-sidebar border-r border-border hidden md:flex flex-col">
        <div className="p-4 text-xl font-bold font-poppins text-primary">Bajaraman</div>
        <nav className="flex-1 p-4 space-y-2">
          <div className="p-2 rounded-md hover:bg-secondary cursor-pointer">Dashboard</div>
          <div className="p-2 rounded-md hover:bg-secondary cursor-pointer">Tasks</div>
          <div className="p-2 rounded-md hover:bg-secondary cursor-pointer">Habits</div>
          <div className="p-2 rounded-md hover:bg-secondary cursor-pointer">Pomodoro</div>
        </nav>
      </aside>
      
      <main className="flex-1 flex flex-col h-full relative">
        {/* Topnav Placeholder */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4">
          <div className="font-semibold md:hidden">Bajaraman</div>
          <div className="flex-1"></div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">U</div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<div>Dashboard Placeholder</div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
