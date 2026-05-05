import Phaser from 'phaser'
import { PlayerState } from '@network/ColyseusClient'

// 플레이어 한 명의 시각적 표현 담당
// 연산 없음 - 서버 상태를 받아서 위치/애니메이션만 업데이트
export class PlayerRenderer {
  private sprite: Phaser.GameObjects.Rectangle // 임시: 실제 스프라이트로 교체 예정
  private nameLabel: Phaser.GameObjects.Text
  private hpBar: Phaser.GameObjects.Rectangle
  private hpBarBg: Phaser.GameObjects.Rectangle

  // 보간용 목표 좌표 (서버 상태와 렌더 위치 사이 부드럽게 이동)
  private targetX: number
  private targetY: number

  constructor(
    private scene: Phaser.Scene,
    private playerId: string,
    private isLocalPlayer: boolean,
    initialState: PlayerState
  ) {
    this.targetX = initialState.x
    this.targetY = initialState.y

    // ── 임시 플레이어 시각화 (스프라이트 에셋 생기면 교체) ──
    this.sprite = scene.add.rectangle(
      initialState.x,
      initialState.y,
      28, 28,
      isLocalPlayer ? 0x88aaff : 0xff8866
    )

    // HP바 배경
    this.hpBarBg = scene.add.rectangle(initialState.x, initialState.y - 24, 32, 5, 0x333333)
    // HP바
    this.hpBar = scene.add.rectangle(initialState.x - 16, initialState.y - 24, 32, 5, 0x44ff88)
    this.hpBar.setOrigin(0, 0.5)

    // 이름 라벨
    this.nameLabel = scene.add.text(initialState.x, initialState.y - 34, playerId.slice(0, 8), {
      fontSize: '10px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5)
    // ────────────────────────────────────────────────────────
  }

  // GameScene update()에서 매 프레임 호출
  update(delta: number): void {
    // 선형 보간으로 부드러운 이동 (서버 틱레이트와 렌더 프레임 분리)
    const lerpFactor = Math.min(1, delta * 0.015)
    this.sprite.x = Phaser.Math.Linear(this.sprite.x, this.targetX, lerpFactor)
    this.sprite.y = Phaser.Math.Linear(this.sprite.y, this.targetY, lerpFactor)

    // HP바, 이름도 따라다님
    this.hpBarBg.setPosition(this.sprite.x, this.sprite.y - 24)
    this.hpBar.setPosition(this.sprite.x - 16, this.sprite.y - 24)
    this.nameLabel.setPosition(this.sprite.x, this.sprite.y - 34)
  }

  // 서버 상태 수신 시 호출
  applyState(state: PlayerState): void {
    this.targetX = state.x
    this.targetY = state.y

    // HP바 너비 업데이트
    const ratio = state.hp / state.maxHp
    this.hpBar.width = 32 * ratio
    this.hpBar.fillColor = ratio > 0.5 ? 0x44ff88 : ratio > 0.25 ? 0xffcc00 : 0xff4444
  }

  destroy(): void {
    this.sprite.destroy()
    this.nameLabel.destroy()
    this.hpBar.destroy()
    this.hpBarBg.destroy()
  }
}
