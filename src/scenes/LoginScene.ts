import Phaser from 'phaser'
import { ApiClient, ApiError } from '@network/ApiClient'

// 로그인 화면
// DOM 오버레이 방식 사용 (Phaser UI만으론 입력폼 구현이 번거로움)
export class LoginScene extends Phaser.Scene {
  private loginForm!: HTMLDivElement

  constructor() {
    super({ key: 'LoginScene' })
  }

  create(): void {
    const { width, height } = this.cameras.main

    // 배경
    this.add.rectangle(width / 2, height / 2, width, height, 0x0d0d1a)

    // 타이틀
    this.add.text(width / 2, height / 2 - 120, 'WBRPG', {
      fontSize: '48px',
      color: '#8899ff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2 - 75, 'Web-Based RPG', {
      fontSize: '14px',
      color: '#555588',
      fontFamily: 'monospace',
    }).setOrigin(0.5)

    // DOM 로그인 폼 생성
    this.createLoginForm()
  }

  private createLoginForm(): void {
    const { width, height } = this.cameras.main

    this.loginForm = document.createElement('div')
    this.loginForm.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) translateY(20px);
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 260px;
    `

    const inputStyle = `
      background: #1a1a2e;
      border: 1px solid #334;
      color: #aaccff;
      padding: 10px 14px;
      font-family: monospace;
      font-size: 14px;
      outline: none;
      width: 100%;
      box-sizing: border-box;
    `

    const usernameInput = document.createElement('input')
    usernameInput.placeholder = '아이디'
    usernameInput.style.cssText = inputStyle
    usernameInput.id = 'login-username'

    const passwordInput = document.createElement('input')
    passwordInput.type = 'password'
    passwordInput.placeholder = '비밀번호'
    passwordInput.style.cssText = inputStyle
    passwordInput.id = 'login-password'

    const loginBtn = document.createElement('button')
    loginBtn.textContent = '로그인'
    loginBtn.style.cssText = `
      background: #334499;
      border: none;
      color: #ffffff;
      padding: 10px;
      font-family: monospace;
      font-size: 14px;
      cursor: pointer;
      width: 100%;
    `

    const errorText = document.createElement('div')
    errorText.style.cssText = `
      color: #ff6666;
      font-family: monospace;
      font-size: 12px;
      text-align: center;
      min-height: 18px;
    `

    loginBtn.addEventListener('click', async () => {
      const username = usernameInput.value.trim()
      const password = passwordInput.value

      if (!username || !password) {
        errorText.textContent = '아이디와 비밀번호를 입력해주세요'
        return
      }

      loginBtn.disabled = true
      loginBtn.textContent = '연결 중...'
      errorText.textContent = ''

      try {
        const res = await ApiClient.login({ username, password })
        // JWT 토큰 세션 저장 (새로고침 시 재로그인)
        sessionStorage.setItem('wbrpg_token', res.token)
        sessionStorage.setItem('wbrpg_player_id', res.playerId)

        // 로그인 폼 제거 후 게임 씬으로 전환
        this.destroyLoginForm()
        this.scene.start('GameScene', { token: res.token, playerId: res.playerId })
      } catch (err) {
        const apiErr = err as ApiError
        errorText.textContent = apiErr.message ?? '로그인 실패'
        loginBtn.disabled = false
        loginBtn.textContent = '로그인'
      }
    })

    // 엔터키로 로그인
    passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') loginBtn.click()
    })

    this.loginForm.appendChild(usernameInput)
    this.loginForm.appendChild(passwordInput)
    this.loginForm.appendChild(loginBtn)
    this.loginForm.appendChild(errorText)

    document.body.appendChild(this.loginForm)
  }

  private destroyLoginForm(): void {
    this.loginForm?.remove()
  }

  // 씬 종료 시 DOM 정리
  shutdown(): void {
    this.destroyLoginForm()
  }
}
