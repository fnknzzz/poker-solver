import React, { useEffect, useState } from 'react'
import { Input, Button, Col, Row, message } from 'antd'
import init, { AiPlayer, Winner } from 'poker-solver'
import style from './style.module.less'
import 'antd/es/input/style/index'
import 'antd/es/col/style/index'
import 'antd/es/row/style/index'
import 'antd/es/button/style/index'
import 'antd/es/message/style/index'

init()

const useInput = (defaultValue = '') => {
  const [value, setValue] = useState(defaultValue)
  return [
    value,
    <Input value={value} onChange={e => setValue(e.target.value)}></Input>,
    setValue
  ] as const
}

export const App = () => {
  const [player, setPlayer] = useState<AiPlayer | null>(null)
  const [first, firstInput] = useInput('778899JQQQKKK2')
  const [second, secondInput] = useInput('TTAA')
  const [play, playInput, setPlay] = useInput()
  const [output, setOutput] = useState('default')
  useEffect(() => {
    if (player?.get_ai_remain() === '') {
      message.info('我出完啦！')
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    }
  })
  return (
    <div className={style.container}>
      {player ? (
        <>
          <Row gutter={16} align="middle" style={{ margin: '48px 0 16px' }}>
            <Col span={4}>你出：</Col>
            <Col span={20}>{playInput}</Col>
          </Row>
          <Button
            onClick={() => {
              setOutput(player.play(play))
              setPlay('')
            }}
            type="primary"
          >
            出牌
          </Button>
          <Row gutter={16} align="middle" style={{ margin: '16px 0' }}>
            <Col span={4}>人类剩余牌：</Col>
            <Col span={20}>{player.get_challenger_remain()}</Col>
          </Row>
          <Row gutter={16} align="middle" style={{ margin: '16px 0' }}>
            <Col span={4}>AI 剩余牌：</Col>
            <Col span={20}>{player.get_ai_remain()}</Col>
          </Row>
          {output === 'default' ? null : (
            <Row gutter={16} align="middle" style={{ margin: '16px 0' }}>
              <Col span={4}>{output ? '我' : '我：'}</Col>
              <Col span={20}>{output ? `出：${output}` : '不出'}</Col>
            </Row>
          )}
        </>
      ) : (
        <>
          <Row gutter={16} align="middle" style={{ margin: '16px 0' }}>
            <Col span={4}>先手：</Col>
            <Col span={20}>{firstInput}</Col>
          </Row>
          <Row gutter={16} align="middle" style={{ margin: '16px 0' }}>
            <Col span={4}>后手：</Col>
            <Col span={20}>{secondInput}</Col>
          </Row>
          <Button
            onClick={() => {
              const now = performance.now()
              const player = AiPlayer.new(first, second)
              const duration = performance.now() - now
              setPlayer(player)
              const winner = player.winner === Winner.First ? '先' : '后'
              message.info(
                `${winner}手胜，我执${winner}手，本次计算用了 ${duration.toFixed(
                  5
                )}ms`,
                2
              )
              setOutput(player.ai_play_default())
            }}
            type="primary"
          >
            开始
          </Button>
        </>
      )}
    </div>
  )
}
