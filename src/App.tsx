import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <h1>毕业设计项目</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          点击计数: {count}
        </button>
      </div>
      <p className="info">
        项目已成功初始化，可以开始开发了！
      </p>
    </div>
  )
}

export default App
