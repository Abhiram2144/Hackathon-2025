import React, { useState } from 'react'

const sampleCourses = [
  {
    id: 'cs101',
    name: 'Computer Science BSc',
    modules: [
      { id: 'cs101-1', name: 'Intro to Programming' },
      { id: 'cs101-2', name: 'Data Structures' },
      { id: 'cs101-3', name: 'Databases' }
    ]
  },
  {
    id: 'eng201',
    name: 'Engineering BEng',
    modules: [
      { id: 'eng201-1', name: 'Mechanics' },
      { id: 'eng201-2', name: 'Electronics' }
    ]
  }
]

export default function ModuleSelection({ university, email }) {
  const [selectedCourse, setSelectedCourse] = useState(sampleCourses[0].id)
  const [selectedModules, setSelectedModules] = useState([])

  function toggleModule(moduleId) {
    setSelectedModules(prev => prev.includes(moduleId) ? prev.filter(m => m !== moduleId) : [...prev, moduleId])
  }

  const course = sampleCourses.find(c => c.id === selectedCourse)

  return (
    <div className="card">
      <h2>Welcome, {email}</h2>
      <p>University: <strong>{university?.name}</strong></p>

      <label>
        Choose your course
        <select value={selectedCourse} onChange={e => { setSelectedCourse(e.target.value); setSelectedModules([]) }}>
          {sampleCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>

      <div className="modules">
        <h3>Modules</h3>
        {course.modules.map(m => (
          <label key={m.id} className="module-item">
            <input type="checkbox" checked={selectedModules.includes(m.id)} onChange={() => toggleModule(m.id)} />
            {m.name}
          </label>
        ))}
      </div>

      <div className="joined">
        <h4>Channels you'll be added to</h4>
        {selectedModules.length === 0 ? <p>No modules selected yet.</p> : (
          <ul>
            {selectedModules.map(id => {
              const m = course.modules.find(x => x.id === id)
              return <li key={id}>{m?.name} — <em>public channel</em></li>
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
