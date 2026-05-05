import Phaser from 'phaser'
import { colyseusClient, GameStateSnapshot, PlayerState } from '@network/ColyseusClient'
import { InputHandler } from '@input/InputHandler'
import { PlayerRenderer } from '@renderers/PlayerRenderer'
import { MapRenderer } from '@renderers/MapRenderer'

interface GameSceneData {
  token: string
  playerId: string
}

export class GameScene extends Phaser.Scene {
  // 씬 데이터
  private token!: string
  private localPlayerId!: string

  // 핸들러 / 렌더러
  private inputHandler!: InputHandler
  private mapRenderer!: MapRenderer

  // 플레이어 렌더러 맵 (sessionId → renderer)
  private playerRenderers = new Map<string, PlayerRenderer>()

  constructor() {
    super({ key: 'GameScene' })
  }

  // LoginScene에서 전달받은 데이터 초기화
  init(data: GameSceneData): void {
    this.token = data.token
    this.localPlayerId = data.playerId
  }

  create(): void {
    // 맵 렌더러 초기화
    this.mapRenderer = new MapRenderer(this)
    this.mapRenderer.createDebugMap() // 에셋 생기면 loadMap()으로 교체

    // 입력 핸들러 초기화
    this.inputHandler = new InputHandler(this)

    // Colyseus 룸 연결
    this.connectToRoom()

    // HUD
    this.createHud()
  }

  update(_time: number, delta: number): void {
    // 입력 처리 → 서버 전송
    this.inputHandler.update()

    // 모든 플레이어 렌더러 업데이트 (보간)
    this.playerRenderers.forEach(renderer => renderer.update(delta))
  }

  private async connectToRoom(): Promise<void> {
    try {
      const room = await colyseusClient.joinRoom(this.token)

      // 서버 상태 변경 수신
      room.onStateChange((state: GameStateSnapshot) => {
        this.syncPlayers(state.players)
      })

      // 룸 에러 처리
      room.onError((code, message) => {
        console.error(`[GameScene] 룸 에러 ${code}:`, message)
        this.handleDisconnect()
      })

      room.onLeave(() => {
        this.handleDisconnect()
      })

    } catch (err) {
      console.error('[GameScene] 룸 연결 실패:', err)
      this.handleDisconnect()
    }
  }

  // 서버 상태 → 렌더러 동기화
  private syncPlayers(players: Map<string, PlayerState>): void {
    // 새 플레이어 추가 / 기존 플레이어 업데이트
    players.forEach((state, sessionId) => {
      if (!this.playerRenderers.has(sessionId)) {
        // 새 플레이어 입장
        const renderer = new PlayerRenderer(
          this,
          sessionId,
          sessionId === colyseusClient.sessionId,
          state
        )
        this.playerRenderers.set(sessionId, renderer)

        // 로컬 플레이어면 카메라 팔로우
        if (sessionId === colyseusClient.sessionId) {
          // 임시: Rectangle을 카메라가 직접 따라가도록 추후 sprite로 교체 시 설정
          this.mapRenderer.setupCamera(this.cameras.main)
        }
      } else {
        // 기존 플레이어 상태 업데이트
        this.playerRenderers.get(sessionId)!.applyState(state)
      }
    })

    // 퇴장한 플레이어 제거
    this.playerRenderers.forEach((renderer, sessionId) => {
      if (!players.has(sessionId)) {
        renderer.destroy()
        this.playerRenderers.delete(sessionId)
      }
    })
  }

  private createHud(): void {
    // 임시 HUD (추후 UiRenderer로 분리)
    this.add.text(16, 16, `WBRPG`, {
      fontSize: '12px',
      color: '#555588',
      fontFamily: 'monospace',
    }).setScrollFactor(0) // 카메라 스크롤 영향 안 받음

    this.add.text(16, 32, `ID: ${this.localPlayerId.slice(0, 12)}`, {
      fontSize: '10px',
      color: '#444466',
      fontFamily: 'monospace',
    }).setScrollFactor(0)
  }

  private handleDisconnect(): void {
    // 재연결 로직 또는 로그인 화면으로 복귀
    sessionStorage.removeItem('wbrpg_token')
    sessionStorage.removeItem('wbrpg_player_id')
    this.cleanup()
    this.scene.start('LoginScene')
  }

  private cleanup(): void {
    this.playerRenderers.forEach(r => r.destroy())
    this.playerRenderers.clear()
    colyseusClient.leave()
    this.inputHandler?.destroy()
    this.mapRenderer?.destroy()
  }

  shutdown(): void {
    this.cleanup()
  }
}
