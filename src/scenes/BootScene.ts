import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload(): void {
    this.createLoadingBar()

    // 솔저 스프라이트시트 로드
    const BASE = 'assets/characters/soldier/'
    this.load.spritesheet('soldier_idle',    BASE + 'Soldier-Idle.png',    { frameWidth: 100, frameHeight: 100 })
    this.load.spritesheet('soldier_walk',    BASE + 'Soldier-Walk.png',    { frameWidth: 100, frameHeight: 100 })
    this.load.spritesheet('soldier_attack1', BASE + 'Soldier-Attack01.png',{ frameWidth: 100, frameHeight: 100 })
    this.load.spritesheet('soldier_attack2', BASE + 'Soldier-Attack02.png',{ frameWidth: 100, frameHeight: 100 })
    this.load.spritesheet('soldier_attack3', BASE + 'Soldier-Attack03.png',{ frameWidth: 100, frameHeight: 100 })
    this.load.spritesheet('soldier_hurt',    BASE + 'Soldier-Hurt.png',    { frameWidth: 100, frameHeight: 100 })
    this.load.spritesheet('soldier_death',   BASE + 'Soldier-Death.png',   { frameWidth: 100, frameHeight: 100 })
  }

  create(): void {
    // 애니메이션 등록
    this.createAnimations()
    this.scene.start('LoginScene')
  }

  private createAnimations(): void {
    const anims = this.anims

    anims.create({
      key: 'soldier_idle',
      frames: anims.generateFrameNumbers('soldier_idle', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: -1,
    })

    anims.create({
      key: 'soldier_walk_side',
      frames: anims.generateFrameNumbers('soldier_walk', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1,
    })

    anims.create({
      key: 'soldier_attack1',
      frames: anims.generateFrameNumbers('soldier_attack1', { start: 0, end: 5 }),
      frameRate: 12,
      repeat: 0,
    })

    anims.create({
      key: 'soldier_attack2',
      frames: anims.generateFrameNumbers('soldier_attack2', { start: 0, end: 5 }),
      frameRate: 12,
      repeat: 0,
    })

    anims.create({
      key: 'soldier_attack3',
      frames: anims.generateFrameNumbers('soldier_attack3', { start: 0, end: 8 }),
      frameRate: 12,
      repeat: 0,
    })

    anims.create({
      key: 'soldier_hurt',
      frames: anims.generateFrameNumbers('soldier_hurt', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0,
    })

    anims.create({
      key: 'soldier_death',
      frames: anims.generateFrameNumbers('soldier_death', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: 0,
    })
  }

  private createLoadingBar(): void {
    const { width, height } = this.cameras.main

    const barBg = this.add.rectangle(width / 2, height / 2, 400, 20, 0x222244)
    const bar   = this.add.rectangle(width / 2 - 200, height / 2, 0, 16, 0x6688ff)
    bar.setOrigin(0, 0.5)

    this.add.text(width / 2, height / 2 - 30, 'LOADING...', {
      fontSize: '14px',
      color: '#aaaacc',
      fontFamily: 'monospace',
    }).setOrigin(0.5)

    this.load.on('progress', (value: number) => { bar.width = 396 * value })
    this.load.on('complete', () => { barBg.destroy(); bar.destroy() })
  }
}
