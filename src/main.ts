import Phaser from 'phaser'
import { BootScene } from '@scenes/BootScene'
import { LoginScene } from '@scenes/LoginScene'
import { GameScene } from '@scenes/GameScene'

// 게임 해상도 상수
const GAME_WIDTH = 1280
const GAME_HEIGHT = 720

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,           // WebGL 우선, 실패 시 Canvas 폴백
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  scene: [
    BootScene,   // 1) 에셋 프리로드
    LoginScene,  // 2) 로그인 UI
    GameScene,   // 3) 메인 게임
  ],
  physics: {
    // 클라이언트에선 물리 연산 안 함 (서버 권위 아키텍처)
    // 서버 상태 받아서 위치만 업데이트
    default: 'arcade',
    arcade: {
      debug: import.meta.env.DEV, // 개발 환경에서만 히트박스 표시
      gravity: { x: 0, y: 0 },
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,         // 화면 크기에 맞게 스케일
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: true, // 픽셀아트 계열 이제 아님
    pixelArt: false,
  }
}

// Phaser 게임 인스턴스 생성
const game = new Phaser.Game(config)

// 개발 환경에서 전역 접근 허용 (디버깅용)
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).game = game
}
