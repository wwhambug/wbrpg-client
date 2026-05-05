import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload(): void {
    // 로딩 진행바 UI
    this.createLoadingBar()

    // ── 에셋 로드 목록 ──────────────────────────────────────
    // 스프라이트시트: 캐릭터 (추후 실제 에셋으로 교체)
    // this.load.spritesheet('player', 'assets/player.png', {
    //   frameWidth: 32,
    //   frameHeight: 32,
    // })

    // 타일맵
    // this.load.tilemapTiledJSON('map_town', 'assets/maps/town.json')
    // this.load.image('tiles_town', 'assets/tiles/town.png')

    // UI 에셋
    // this.load.image('ui_healthbar', 'assets/ui/healthbar.png')
    // ───────────────────────────────────────────────────────
  }

  create(): void {
    // 에셋 로드 완료 → 로그인 씬으로 전환
    this.scene.start('LoginScene')
  }

  private createLoadingBar(): void {
    const { width, height } = this.cameras.main

    const barBg = this.add.rectangle(width / 2, height / 2, 400, 20, 0x222244)
    const bar = this.add.rectangle(width / 2 - 200, height / 2, 0, 16, 0x6688ff)
    bar.setOrigin(0, 0.5)

    this.add.text(width / 2, height / 2 - 30, 'LOADING...', {
      fontSize: '14px',
      color: '#aaaacc',
      fontFamily: 'monospace',
    }).setOrigin(0.5)

    // 로딩 진행률 업데이트
    this.load.on('progress', (value: number) => {
      bar.width = 396 * value
    })

    this.load.on('complete', () => {
      barBg.destroy()
      bar.destroy()
    })
  }
}
