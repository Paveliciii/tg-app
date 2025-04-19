import { useState, useEffect, useRef } from 'react'
import WebApp from '@twa-dev/sdk'
import './App.css'

interface UserData {
  id?: number
  first_name?: string
  last_name?: string
  username?: string
  language_code?: string
}

interface ClickAnimation {
  id: number
  value: number
  x: number
  y: number
  isAutoClicker: boolean
}

function App() {
  const [score, setScore] = useState<number>(0)
  const [highScore, setHighScore] = useState<number>(0)
  const [userData, setUserData] = useState<UserData>({})
  const [clickPower, setClickPower] = useState<number>(1)
  const [autoClicker, setAutoClicker] = useState<number>(0)
  const [autoClickerCost, setAutoClickerCost] = useState<number>(10)
  const [clickAnimations, setClickAnimations] = useState<ClickAnimation[]>([])
  const [animationId, setAnimationId] = useState<number>(0)
  const scoreRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    // Initialize Telegram WebApp
    WebApp.ready()
    
    // Get user data
    const initData = WebApp.initDataUnsafe
    if (initData.user) {
      setUserData(initData.user)
    }

    // Load saved game state
    const savedScore = localStorage.getItem('clickerScore')
    const savedHighScore = localStorage.getItem('clickerHighScore')
    const savedClickPower = localStorage.getItem('clickerPower')
    const savedAutoClicker = localStorage.getItem('clickerAutoClicker')

    console.log('Loading saved state:', {
      savedScore,
      savedHighScore,
      savedClickPower,
      savedAutoClicker
    })

    if (savedScore) setScore(parseInt(savedScore))
    if (savedHighScore) setHighScore(parseInt(savedHighScore))
    if (savedClickPower) setClickPower(parseInt(savedClickPower))
    if (savedAutoClicker) setAutoClicker(parseInt(savedAutoClicker))
  }, [])

  useEffect(() => {
    // Auto-clicker interval
    const interval = setInterval(() => {
      if (autoClicker > 0) {
        // Add auto-clicker animation first
        if (scoreRef.current) {
          const rect = scoreRef.current.getBoundingClientRect()
          const x = rect.width / 2
          const y = rect.height / 2
          
          const newAnimation: ClickAnimation = {
            id: animationId,
            value: autoClicker,
            x,
            y,
            isAutoClicker: true
          }
          
          setClickAnimations(prev => [...prev, newAnimation])
          setAnimationId(prev => prev + 1)

          // Update score immediately with animation
          setScore(prev => {
            const newScore = prev + autoClicker
            localStorage.setItem('clickerScore', newScore.toString())
            if (newScore > highScore) {
              setHighScore(newScore)
              localStorage.setItem('clickerHighScore', newScore.toString())
            }
            return newScore
          })

          // Remove animation after 1 second
          setTimeout(() => {
            setClickAnimations(prev => prev.filter(anim => anim.id !== newAnimation.id))
          }, 1000)
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [autoClicker, animationId, highScore])

  const handleClick = (e: React.MouseEvent) => {
    const newScore = score + clickPower
    setScore(newScore)
    localStorage.setItem('clickerScore', newScore.toString())
    
    if (newScore > highScore) {
      setHighScore(newScore)
      localStorage.setItem('clickerHighScore', newScore.toString())
    }

    // Add click animation
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const newAnimation: ClickAnimation = {
      id: animationId,
      value: clickPower,
      x,
      y,
      isAutoClicker: false
    }
    
    setClickAnimations(prev => [...prev, newAnimation])
    setAnimationId(prev => prev + 1)

    // Remove animation after 1 second
    setTimeout(() => {
      setClickAnimations(prev => prev.filter(anim => anim.id !== newAnimation.id))
    }, 1000)
  }

  const upgradeClickPower = () => {
    if (score >= clickPower * 10) {
      setScore(prev => prev - clickPower * 10)
      setClickPower(prev => {
        const newPower = prev + 1
        localStorage.setItem('clickerPower', newPower.toString())
        return newPower
      })
    }
  }

  const buyAutoClicker = () => {
    if (score >= autoClickerCost) {
      setScore(prev => prev - autoClickerCost)
      setAutoClicker(prev => {
        const newAutoClicker = prev + 1
        localStorage.setItem('clickerAutoClicker', newAutoClicker.toString())
        return newAutoClicker
      })
      setAutoClickerCost(prev => prev * 2)
    }
  }

  const finishGame = () => {
    WebApp.sendData(JSON.stringify({
      score,
      highScore,
      clickPower,
      autoClicker
    }))
    WebApp.close()
  }

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-purple-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Telegram Clicker Game</h1>
        {userData.first_name && (
          <p className="text-gray-700">Welcome, {userData.first_name}!</p>
        )}
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <div className="text-center mb-6 relative" ref={scoreRef}>
          <p className="text-5xl font-bold mb-2 text-gray-800">{score}</p>
          <p className="text-gray-600">High Score: {highScore}</p>
          {clickAnimations.map(anim => (
            <span
              key={anim.id}
              className={`absolute font-bold animate-float-up ${
                anim.isAutoClicker ? 'text-purple-500' : 'text-green-500'
              }`}
              style={{
                left: `${anim.x}px`,
                top: `${anim.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              +{anim.value}
            </span>
          ))}
        </div>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-gray-700 mb-1">Current Click Power: <span className="font-bold text-blue-600">+{clickPower}</span></p>
          <p className="text-gray-700">Auto-Clickers: <span className="font-bold text-purple-600">{autoClicker}</span> (+{autoClicker}/sec)</p>
        </div>

        <button
          onClick={handleClick}
          className="w-full bg-blue-600 text-white py-4 rounded-lg text-xl font-bold mb-4 hover:bg-blue-700 transition-colors relative shadow-md"
        >
          Click Me! (+{clickPower})
        </button>

        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <button
              onClick={upgradeClickPower}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={score < clickPower * 10}
            >
              Upgrade Click Power
            </button>
            <p className="text-center mt-2 text-gray-700">
              Cost: <span className="font-bold text-green-600">{clickPower * 10}</span> points
              <br />
              New Power: <span className="font-bold text-green-600">+{clickPower + 1}</span>
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <button
              onClick={buyAutoClicker}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={score < autoClickerCost}
            >
              Buy Auto-Clicker
            </button>
            <p className="text-center mt-2 text-gray-700">
              Cost: <span className="font-bold text-purple-600">{autoClickerCost}</span> points
              <br />
              New Auto-Clickers: <span className="font-bold text-purple-600">{autoClicker + 1}</span>
            </p>
          </div>
        </div>

        <button
          onClick={finishGame}
          className="w-full mt-6 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors shadow-md"
        >
          Finish Game
        </button>
      </div>
    </div>
  )
}

export default App
