import Phaser from 'phaser'
import { colyseusClient } from '@network/ColyseusClient'

// 클라이언트에서 연산 없이 입력만 서버로 전달
export class InputHandler {
  private keys!: {
    up: Phaser.Input.Keyboard.Key
    down: Phaser.Input.Keyboard.Key
    left: Phaser.Input.Keyboard.Key
    right: Phaser.Input.Keyboard.Key
    attack: Phaser.Input.Keyboard.Key
    interact: Phaser.Input.Keyboard.Key
  }

  // 이전 프레임 입력 상태 (변경 시에만 전송하기 위해)
  private prevDx = 0
  private prevDy = 0

  constructor(private scene: Phaser.Scene) {
    const kb = scene.input.keyboard!
    this.keys = {
      up:       kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      attack:   kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      interact: kb.addKey(Phaser.Input.Keyboard.KeyCodes.F),
    }
  }

  // GameScene의 update()에서 매 프레임 호출
  update(): void {
    this.handleMovement()
    this.handleAction()
  }

  private handleMovement(): void {
    let dx = 0
    let dy = 0

    if (this.keys.left.isDown)  dx = -1
    if (this.keys.right.isDown) dx = 1
    if (this.keys.up.isDown)    dy = -1
    if (this.keys.down.isDown)  dy = 1

    // 변경이 있을 때만 서버로 전송 (불필요한 메시지 줄임)
    if (dx !== this.prevDx || dy !== this.prevDy) {
      colyseusClient.send({ type: 'move', dx, dy })
      this.prevDx = dx
      this.prevDy = dy
    }
  }

  private handleAction(): void {
    // 공격 키 (just pressed)
    if (Phaser.Input.Keyboard.JustDown(this.keys.attack)) {
      // targetId는 서버가 방향/범위로 판정 - 클라이언트는 그냥 전송
      colyseusClient.send({ type: 'attack', targetId: '' })
    }

    // 상호작용 키
    if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) {
      colyseusClient.send({ type: 'interact', objectId: '' })
    }
  }

  destroy(): void {
    // 씬 종료 시 키 리스너 정리
    Object.values(this.keys).forEach(key => key.destroy())
  }
}
