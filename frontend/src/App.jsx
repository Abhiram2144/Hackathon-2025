import React from 'react'
import Onboarding from './components/Onboarding'

export default function App() {
  return (
    <div className="app">
      <header>
        <h1>University Life Assistant — Mockup</h1>
        <p>Quick prototype: onboarding, OTP mock, module selection, and auto-enroll preview.</p>
      </header>
      <main>
        <Onboarding />
      </main>
    </div>
  )
}
