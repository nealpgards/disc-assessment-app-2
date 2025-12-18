'use client'

import React, { useState, FormEvent } from 'react'

import AdminDashboard from '@/components/AdminDashboard'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function AdminPage() {
  const [enteredTeamCode, setEnteredTeamCode] = useState('')
  const [activeTeamCode, setActiveTeamCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const normalized = enteredTeamCode.trim().toUpperCase()

    if (!normalized) {
      setError('Please enter your team code.')
      return
    }

    setError(null)
    setActiveTeamCode(normalized)
  }

  if (!activeTeamCode) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center py-10">
        <div className="max-w-md w-full px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Team Admin Access</h1>
              <p className="text-sm text-slate-600">
                Enter your team code to view DISC and Driving Forces results for your team. This page is not linked
                from the public assessment and is intended for team leaders and HR.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamCode">Team code</Label>
                <Input
                  id="teamCode"
                  type="text"
                  autoComplete="off"
                  value={enteredTeamCode}
                  onChange={(e) => setEnteredTeamCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SALES2025"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" className="w-full">
                View team results
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return <AdminDashboard key={activeTeamCode} initialTeamCode={activeTeamCode} />
}

