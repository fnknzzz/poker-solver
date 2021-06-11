import React, { useEffect } from 'react'
import init, { AiPlayer, Winner } from 'poker-solver'

export const App = () => {
  useEffect(() => {
    init().then(() => {
      window.player = AiPlayer.new('778899JQQQKKK2', 'TTAA')
    })
  }, [])
  return <div>ff</div>
}
