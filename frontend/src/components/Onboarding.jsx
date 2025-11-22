import React, { useState } from 'react'
import ModuleSelection from './ModuleSelection'

const sampleUniversities = [
  { id: 'u-swansea', name: 'Swansea University', domain: 'swansea.ac.uk' },
  { id: 'u-oxford', name: 'University of Oxford', domain: 'ox.ac.uk' },
  { id: 'u-example', name: 'Example University', domain: 'example.edu' }
]

export default function Onboarding() {
  const [university, setUniversity] = useState(sampleUniversities[0].id)
  const [email, setEmail] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpInput, setOtpInput] = useState('')
  const [verified, setVerified] = useState(false)

  function sendOtp() {
    // Mock OTP generation — in real app this would call the backend
    const code = String(Math.floor(100000 + Math.random() * 900000))
    setOtpCode(code)
    setOtpSent(true)
    alert(`(Mock) OTP sent to ${email}: ${code}`)
  }

  function verifyOtp() {
    if (otpInput === otpCode) {
      setVerified(true)
    } else {
      alert('Incorrect OTP (this is a mock). Try again or resend.')
    }
  }

  return (
    <section className="onboarding">
      {!verified ? (
        <div className="card">
          <h2>Sign up / Verify</h2>
          <label>
            University
            <select value={university} onChange={e => setUniversity(e.target.value)}>
              {sampleUniversities.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </label>

          <label>
            University Email
            <input
              type="email"
              placeholder="you@student.university.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>

          {!otpSent ? (
            <button className="primary" onClick={sendOtp} disabled={!email}>Send OTP</button>
          ) : (
            <div>
              <label>
                Enter OTP
                <input value={otpInput} onChange={e => setOtpInput(e.target.value)} />
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={verifyOtp} className="primary">Verify</button>
                <button onClick={sendOtp}>Resend</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <ModuleSelection university={sampleUniversities.find(u => u.id === university)} email={email} />
      )}
    </section>
  )
}
