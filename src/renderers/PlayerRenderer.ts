import Phaser from 'phaser'
import { PlayerState } from '@network/ColyseusClient'

export class PlayerRenderer {
  private sprite!: Phaser.GameObjects.Sprite
  private nameLabel!: Phaser.GameObjects.Text
  private hpBar!: Phaser.GameObjects.Rectangle
  private hpBarBg!: Phaser.GameObjects.Rectangle

  private targetX: number
  private targetY: number
  private facingLeft = false

  constructor(
    private scene: Phaser.Scene,
    private playerId: string,
    private isLocalPlayer: boolean,
    initialState: PlayerState
  ) {
    this.targetX = initialState.x
    this.targetY = initialState.y

    // 스프라이트 생성
    this.sprite = scene.add.sprite(initialState.x, initialState.y, 'soldier_idle')
    this.sprite.setScale(2) // 100x100 → 70x70
    this.sprite.play('soldier_idle')

    // 로컬 플레이어는 파란 틴트, 다른 플레이어는 붉은 틴트
    if (!isLocalPlayer) {
      this.sprite.setTint(0xff9999)
    }

    // HP바
    this.hpBarBg = scene.add.rectangle(initialState.x, initialState.y - 44, 50, 5, 0x333333)
    this.hpBar   = scene.add.rectangle(initialState.x - 25, initialState.y - 44, 50, 5, 0x44ff88)
    this.hpBar.setOrigin(0, 0.5)

    // 이름 라벨
    this.nameLabel = scene.add.text(initialState.x, initialState.y - 54, playerId.slice(0, 8), {
      fontSize: '10px',
      color: isLocalPlayer ? '#aaddff' : '#ffaaaa',
      fontFamily: 'monospace',
    }).setOrigin(0.5)
  }

  update(delta: number): void {
    const lerpFactor = Math.min(1, delta * 0.015)
    this.sprite.x = Phaser.Math.Linear(this.sprite.x, this.targetX, lerpFactor)
    this.sprite.y = Phaser.Math.Linear(this.sprite.y, this.targetY, lerpFactor)

    this.hpBarBg.setPosition(this.sprite.x, this.sprite.y - 44)
    this.hpBar.setPosition(this.sprite.x - 25, this.sprite.y - 44)
    this.nameLabel.setPosition(this.sprite.x, this.sprite.y - 54)
  }

  applyState(state: PlayerState): void {
    this.targetX = state.x
    this.targetY = state.y

    // 좌우 플립
    if (state.direction === 'left') {
      this.sprite.setFlipX(true)
      this.facingLeft = true
    } else if (state.direction === 'right') {
      this.sprite.setFlipX(false)
      this.facingLeft = false
    }

    // 애니메이션 전환
    if (state.isMoving) {
      if (this.sprite.anims.currentAnim?.key !== 'soldier_walk_side') {
        this.sprite.play('soldier_walk_side')
      }
    } else {
      if (this.sprite.anims.currentAnim?.key !== 'soldier_idle') {
        this.sprite.play('soldier_idle')
      }
    }

    // HP바 업데이트
    const ratio = state.hp / state.maxHp
    this.hpBar.width = 50 * ratio
    this.hpBar.fillColor = ratio > 0.5 ? 0x44ff88 : ratio > 0.25 ? 0xffcc00 : 0xff4444
  }

  // 공격 애니메이션 재생 (외부에서 호출)
  playAttack(type: 1 | 2 | 3 = 1): void {
    this.sprite.play(`soldier_attack${type}`, true)
    this.sprite.once('animationcomplete', () => {
      this.sprite.play('soldier_idle')
    })
  }

  // 피격 애니메이션
  playHurt(): void {
    this.sprite.play('soldier_hurt', true)
    this.sprite.once('animationcomplete', () => {
      this.sprite.play('soldier_idle')
    })
  }

  destroy(): void {
    this.sprite.destroy()
    this.nameLabel.destroy()
    this.hpBar.destroy()
    this.hpBarBg.destroy()
  }
}
