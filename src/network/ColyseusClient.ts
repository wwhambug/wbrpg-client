import Colyseus from 'colyseus.js'

// 서버에서 정의한 GameState 스키마와 맞춰야 함
// 추후 @colyseus/schema 코드젠으로 자동화 가능
export interface PlayerState {
  id: string
  x: number
  y: number
  hp: number
  maxHp: number
  direction: 'up' | 'down' | 'left' | 'right'
  isMoving: boolean
}

export interface GameStateSnapshot {
  players: Map<string, PlayerState>
  tick: number
}

// 클라이언트에서 서버로 보내는 입력 메시지 타입
export type ClientMessage =
  | { type: 'move'; dx: number; dy: number }
  | { type: 'attack'; targetId: string }
  | { type: 'interact'; objectId: string }

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3000'

class ColyseusClientManager {
  private client: Colyseus.Client
  private room: Colyseus.Room | null = null

  constructor() {
    this.client = new Colyseus.Client(WS_URL)
  }

  // 게임 룸 입장 (JWT 토큰 함께 전송)
  async joinRoom(token: string): Promise<Colyseus.Room> {
    this.room = await this.client.joinOrCreate('game_room', { token })
    return this.room
  }

  // 서버로 입력 전송
  send(message: ClientMessage): void {
    if (!this.room) {
      console.warn('[Colyseus] 룸에 연결되지 않은 상태에서 send 호출됨')
      return
    }
    this.room.send(message.type, message)
  }

  // 룸 상태 변경 콜백 등록
  onStateChange(callback: (state: GameStateSnapshot) => void): void {
    this.room?.onStateChange(callback)
  }

  // 서버 메시지 수신 콜백
  onMessage<T>(type: string, callback: (data: T) => void): void {
    this.room?.onMessage(type, callback)
  }

  // 연결 해제
  leave(): void {
    this.room?.leave()
    this.room = null
  }

  get sessionId(): string | undefined {
    return this.room?.sessionId
  }
}

// 싱글톤으로 관리
export const colyseusClient = new ColyseusClientManager()
