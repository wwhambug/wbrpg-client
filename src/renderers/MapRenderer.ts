import Phaser from 'phaser'

// 타일맵 렌더링 담당
// 추후 Tiled 에디터로 만든 JSON 맵 로드
export class MapRenderer {
  private tilemap: Phaser.Tilemaps.Tilemap | null = null

  constructor(private scene: Phaser.Scene) {}

  // BootScene에서 타일맵 에셋 로드 후 호출
  loadMap(mapKey: string, tilesetKey: string, tilesetImageKey: string): void {
    this.tilemap = this.scene.make.tilemap({ key: mapKey })
    const tileset = this.tilemap.addTilesetImage(tilesetKey, tilesetImageKey)
    if (!tileset) {
      console.error(`[MapRenderer] 타일셋 로드 실패: ${tilesetKey}`)
      return
    }

    // 레이어 순서: ground → objects → above (위에 그려지는 레이어)
    this.tilemap.createLayer('ground', tileset, 0, 0)
    this.tilemap.createLayer('objects', tileset, 0, 0)
    // above 레이어는 플레이어 위에 렌더링 (나무 위 등)
    // const aboveLayer = this.tilemap.createLayer('above', tileset, 0, 0)
    // aboveLayer?.setDepth(10)
  }

  // 카메라가 맵 경계를 벗어나지 않도록 설정
  setupCamera(camera: Phaser.Cameras.Scene2D.Camera): void {
    if (!this.tilemap) return
    camera.setBounds(
      0, 0,
      this.tilemap.widthInPixels,
      this.tilemap.heightInPixels
    )
  }

  // 충돌 타일 레이어 반환 (서버에서 이미 처리하지만, 클라이언트 카메라 등에 활용)
  getTilemap(): Phaser.Tilemaps.Tilemap | null {
    return this.tilemap
  }

  // 임시 맵 (에셋 없을 때 테스트용)
  createDebugMap(): void {
    const graphics = this.scene.add.graphics()
    // 32x32 타일 그리드 시각화
    graphics.lineStyle(1, 0x333355, 0.5)
    for (let x = 0; x < 1280; x += 32) {
      graphics.moveTo(x, 0)
      graphics.lineTo(x, 720)
    }
    for (let y = 0; y < 720; y += 32) {
      graphics.moveTo(0, y)
      graphics.lineTo(1280, y)
    }
    graphics.strokePath()

    // 맵 경계
    graphics.lineStyle(2, 0x6688ff, 1)
    graphics.strokeRect(0, 0, 1280, 720)
  }

  destroy(): void {
    this.tilemap?.destroy()
  }
}
