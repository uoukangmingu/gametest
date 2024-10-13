﻿﻿﻿let score = 0;
let currentKeys = [];
let currentDirections = [];
let typingCount = 0;
let typingGoal = 0;
let timeLimit = 3000;
let gameMode = 'keys';
let roundStartTime;
const directions = ['left', 'up', 'right', 'down'];
let usedKeys = [];
let currentMusic = null;

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function enforcePortraitMode() {
    if (isMobileDevice()) {
        const lockPortraitOrientation = () => {
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('portrait').catch(() => {
                    console.log('화면 방향 고정을 지원하지 않는 기기입니다.');
                });
            }
        };

        window.addEventListener('load', lockPortraitOrientation);
        window.addEventListener('orientationchange', lockPortraitOrientation);

        // CSS를 이용해 세로 모드 강제
        const style = document.createElement('style');
        style.textContent = `
            @media screen and (orientation: landscape) {
                body {
                    transform: rotate(-90deg);
                    transform-origin: left top;
                    width: 100vh;
                    height: 100vw;
                    overflow-x: hidden;
                    position: absolute;
                    top: 100%;
                    left: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// 게임 시작 시 이 함수를 호출
enforcePortraitMode();

function playMusic(difficulty) {
    if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
    }

    let musicId;
    switch(difficulty) {
        case 6000:
            musicId = 'easy-music';
            break;
        case 3000:
            musicId = 'normal-music';
            break;
        case 1500:
            musicId = 'hard-music';
            break;
        default:
            musicId = 'easy-music';
    }

    currentMusic = document.getElementById(musicId);
    if (currentMusic) {
        currentMusic.play();
    }
    if (currentMusic) {
        currentMusic.volume = currentVolume;
        currentMusic.play();
    }
}


let currentDifficulty;

function startGame(difficulty) {
    currentDifficulty = difficulty;
    timeLimit = difficulty;
    score = 0;
    document.getElementById('score-value').textContent = score;
    document.getElementById('main-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';
    startCountdown();
}



function startCountdown() {
    document.getElementById('countdown').style.display = 'block';
    let count = 3;
    CountdownSound();
    document.getElementById('countdown-number').textContent = count;
    let countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            CountdownSound();
            document.getElementById('countdown-number').textContent = count;
        } else {
            clearInterval(countdownInterval);
            document.getElementById('countdown').style.display = 'none';
            document.getElementById('game-container').style.display = 'flex';
            playMusic(timeLimit);
            startRound();
        }
    }, 1000);
}


function resetGame() {
    setTimeout(() => {
        score = 0;
        document.getElementById('score-value').textContent = score;
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('main-screen').style.display = 'flex';
        
        document.getElementById('register-score-button').style.display = 'block';

        // 메인 화면 레이아웃 수정
        const mainScreen = document.getElementById('main-screen');
        mainScreen.style.flexDirection = 'column';
        mainScreen.style.justifyContent = 'center';
        mainScreen.style.alignItems = 'center';

        // 난이도 버튼과 리더보드를 감싸는 div 생성
        const buttonsContainer = document.createElement('div');
        buttonsContainer.id = 'difficulty-buttons-container';
        const leaderboardContainer = document.createElement('div');
        leaderboardContainer.id = 'main-leaderboard-container';

        // 기존 요소들을 새 컨테이너로 이동
        buttonsContainer.appendChild(document.getElementById('difficulty-buttons'));
        leaderboardContainer.appendChild(document.getElementById('main-leaderboard'));

        // 메인 화면에 새 컨테이너 추가
        mainScreen.appendChild(buttonsContainer);
        mainScreen.appendChild(leaderboardContainer);
    }, 100);

    const gameOverScreen = document.getElementById('game-over');
    gameOverScreen.style.left = '50%';
    gameOverScreen.style.transform = 'translate(-50%, -50%)';

    updateMainLeaderboard();
}


function updateMainLeaderboard() {
    const mainScoreList = document.getElementById('main-score-list');
    mainScoreList.innerHTML = '';
    const topScores = scores.slice(0, 10);
    topScores.forEach((score, index) => {
        const li = document.createElement('li');
        li.textContent = `${score.name}: ${score.score}`;
        mainScoreList.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', updateMainLeaderboard);

function getRandomKey() {
    const keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let availableKeys = keys.split('').filter(key => !usedKeys.includes(key));
    
    if (availableKeys.length === 0) {
        usedKeys = []; // 모든 키를 사용했다면 초기화
        availableKeys = keys.split('');
    }
    
    const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
    usedKeys.push(randomKey);
    return randomKey;
}

function getRandomDirection() {
    return directions[Math.floor(Math.random() * directions.length)];
}
// 모바일용 버튼 생성 함수
function createMobileButtons() {
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'mobile-buttons';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.marginTop = '20px';

    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const buttonLetters = [...currentKeys];
    
    while (buttonLetters.length < 5) {
        const randomLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
        if (!buttonLetters.includes(randomLetter)) {
            buttonLetters.push(randomLetter);
        }
    }

    // Fisher-Yates 셔플 알고리즘
    for (let i = buttonLetters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [buttonLetters[i], buttonLetters[j]] = [buttonLetters[j], buttonLetters[i]];
    }

    buttonLetters.forEach(letter => {
        const button = document.createElement('button');
        button.textContent = letter;
        button.classList.add('mobile-button');
        button.style.margin = '0 5px';
        button.style.padding = '10px 20px';
        button.style.fontSize = '20px';
        button.addEventListener('click', () => {
            handleMobileKeyPress(letter);
            playButtonSound();
            button.classList.add('pressed'); 
            button.classList.add('mobile-button');
            setTimeout(() => button.classList.remove('pressed'), 200);  // 200ms 후 클래스 제거
        });
        buttonContainer.appendChild(button);
    });

    document.getElementById('game-container').appendChild(buttonContainer);
}

// 모바일 버튼 클릭 처리 함수
function handleMobileKeyPress(letter) {
    if (currentKeys.includes(letter)) {
        currentKeys = currentKeys.filter(key => key !== letter);
        if (currentKeys.length === 0) {
            playClearSound();
            startRound();
        }
    }
}

function displayKeys() {
    currentKeys = [getRandomKey(), getRandomKey()];
    const keyDisplay = document.getElementById('keys-display');
    keyDisplay.textContent = currentKeys.join(' ');
    keyDisplay.classList.remove('shake');
    void keyDisplay.offsetWidth;
    keyDisplay.classList.add('shake');
    document.getElementById('directions-display').style.display = 'none';
    document.getElementById('point-game').style.display = 'none';
    keyDisplay.style.display = 'block';
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        createMobileButtons();
    }
}

function createDirectionButtons() {
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'mobile-direction-buttons';
    buttonContainer.style.display = 'grid';
    buttonContainer.style.gridTemplateAreas = 
        '"   .    up     .   " ' +
        '"left  down  right"';
    buttonContainer.style.gap = '10px';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.marginTop = '20px';

    const directions = ['up', 'down', 'left', 'right'];
    directions.forEach(dir => {
        const button = document.createElement('button');
        button.textContent = dir.toUpperCase();
        button.classList.add('mobile-button');
        button.classList.add('pressed'); 
        button.style.padding = '15px';
        button.style.fontSize = '18px';
        button.style.gridArea = dir;
button.addEventListener('click', () => {
handleDirectionPress(dir);
playButtonSound();
button.classList.add('pressed');
setTimeout(() => button.classList.remove('pressed'), 100); 
});
buttonContainer.appendChild(button);
});

    document.getElementById('game-container').appendChild(buttonContainer);
}

function handleDirectionPress(direction) {
    if (currentDirections[0] === direction) {
        currentDirections.shift();
        if (currentDirections.length === 0) {
            playClearSound();
            startRound();
        }
    } else {
        gameOver();
    }
}

function displayDirections() {
    currentDirections = Array(3).fill().map(() => getRandomDirection());
    const directionsDisplay = document.getElementById('directions-display');
    directionsDisplay.innerHTML = currentDirections.map(dir => 
        `<span class="arrow arrow-${dir}"></span>`
    ).join('');
    document.getElementById('keys-display').style.display = 'none';
    document.getElementById('point-game').style.display = 'none';
    directionsDisplay.style.display = 'block';
}

function startTypingMode() {
    typingCount = 0;
    typingGoal = Math.floor(Math.random() * 12) + 1; // 1에서 12 사이의 랜덤 숫자
    document.getElementById('keys-display').textContent = `Ctrl 키를 ${typingGoal}번 눌러라!`;
    document.getElementById('keys-display').style.display = 'block';
    document.getElementById('directions-display').style.display = 'none';
    document.getElementById('point-game').style.display = 'none';
}

function startPointingMode() {
    document.getElementById('keys-display').style.display = 'none';
    document.getElementById('directions-display').style.display = 'none';
    document.getElementById('point-game').style.display = 'block';
    moveTarget();
}

function moveTarget() {
    const target = document.getElementById('target');
    const gameArea = document.getElementById('point-game');
    const maxX = gameArea.clientWidth - target.clientWidth;
    const maxY = gameArea.clientHeight - target.clientHeight;
    
    target.style.left = Math.random() * maxX + 'px';
    target.style.top = Math.random() * maxY + 'px';
}

function resetTimerBar() {
    const timerBar = document.getElementById('timer-bar');
    timerBar.innerHTML = '<div></div>';
    const timerBarInner = timerBar.firstChild;
    
    timerBarInner.style.animation = 'none';
    void timerBarInner.offsetWidth; // 리플로우 강제 발생
    timerBarInner.style.animation = `timer ${timeLimit/1000}s linear forwards`;
}


function hideAllGameModes() {
document.getElementById('keys-display').style.display = 'none';
document.getElementById('directions-display').style.display = 'none';
document.getElementById('point-game').style.display = 'none';
document.getElementById('spin-game').style.display = 'none';
document.getElementById('color-game').style.display = 'none'; 
document.getElementById('ascend').style.display = 'none';
document.getElementById('precision-time-game').style.display = 'none';
document.getElementById('rps-game').style.display = 'none';
}

function handleKeyPress(event) {
    if (isGameOver) return;  // 게임 오버 상태면 키 입력 무시
    if (gameMode === 'hacking') {
        if (/^[a-zA-Z]$/.test(event.key)) {
            hackingCount++;
            updateHackingDisplay();
            createHackingEffect();
            if (hackingCount >= hackingGoal) {
                playClearSound();
                startRound();
            }
        }
    }
    if (gameMode === 'keys') {
        handleKeysMode(event);
    } else if (gameMode === 'directions') {
        handleDirectionsMode(event);
    } else if (gameMode === 'typing') {
        handleTypingMode(event);
    }
}

function handleKeysMode(event) {
    if (isGameOver) return; 
    const pressedKey = event.key.toUpperCase();
    if (currentKeys.includes(pressedKey)) {
        currentKeys = currentKeys.filter(key => key !== pressedKey);
        if (currentKeys.length === 0) {
            document.getElementById('score-value').textContent = score;
    playClearSound();
            startRound();
        }
    }
}

function handleDirectionsMode(event) {
    if (isGameOver) return; 
    const keyToDirection = {
        'ArrowLeft': 'left',
        'ArrowUp': 'up',
        'ArrowRight': 'right',
        'ArrowDown': 'down'
    };

    const pressedDirection = keyToDirection[event.key];
    if (pressedDirection === currentDirections[0]) {
        currentDirections.shift();
        if (currentDirections.length === 0) {
            document.getElementById('score-value').textContent = score;
    playClearSound();
            startRound();
        }
    } else if (pressedDirection) {
        gameOver();
    }
}

function createCtrlButton() {
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'mobile-ctrl-button';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.marginTop = '20px';

const button = document.createElement('button');
button.textContent = 'Ctrl';
button.classList.add('mobile-button'); // 클래스 추가
button.classList.add('pressed'); 
button.style.padding = '15px 30px';
button.style.fontSize = '20px';
button.style.backgroundColor = 'var(--retro-dark-green)';
button.style.color = 'var(--retro-beige)'; 
button.style.border = '2px solid var(--retro-black)';
button.style.borderRadius = '0';
button.style.boxShadow = '3px 3px 0 var(--retro-black)';
button.addEventListener('click', () => {
    handleCtrlPress();
    playButtonSound();
    button.classList.add('pressed');
    setTimeout(() => button.classList.remove('pressed'), 100);
});
buttonContainer.appendChild(button);


document.getElementById('game-container').appendChild(buttonContainer);
}

function handleCtrlPress() {
    typingCount++;
    document.getElementById('keys-display').textContent = `Ctrl 키를 ${typingGoal - typingCount}번 더 누르세요!`;
    if (typingCount >= typingGoal) {
        playClearSound();
        startRound();
    }
}

function handleTypingMode(event) {
    if (isGameOver) return; 
    if (event.key === 'Control' || event.code === 'ControlRight') {
        typingCount++;
        document.getElementById('keys-display').textContent = `Ctrl 키를 ${typingGoal - typingCount}번 더 누르세요!`;
        if (typingCount >= typingGoal) {
            document.getElementById('score-value').textContent = score;
    playClearSound();
            startRound();
        }
    }
}

function handlePointingMode(event) {
    if (isGameOver) return; 
    if (event.target.id === 'target') {
        document.getElementById('score-value').textContent = score;
    playClearSound();
        startRound();
    } else {
        gameOver();
    }
}

let isGameOver = false;

function gameOver() {
    isGameOver = true;
    lostSound();
    clearTimeout(window.roundTimer);
    document.getElementById('main-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('final-score').textContent = score;
    if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
    }
}

function restartGame() {
    setTimeout(() => {
        score = 0;
        gameMode = 'keys';
        document.getElementById('score-value').textContent = score;
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('keys-display').style.display = 'none';
        document.getElementById('directions-display').style.display = 'none';
        document.getElementById('point-game').style.display = 'none';
        document.getElementById('register-score-button').style.display = 'block';
        const mainScreen = document.getElementById('main-screen');
        mainScreen.style.flexDirection = 'row';
        mainScreen.style.justifyContent = 'center';
        mainScreen.style.alignItems = 'center';
        resetTimerBar();
        if (window.roundTimer) {
            clearTimeout(window.roundTimer);
        }
        startGame(currentDifficulty);
    }, 100);
}



document.addEventListener('keydown', handleKeyPress);
document.getElementById('restart-button').addEventListener('click', restartGame);
document.getElementById('point-game').addEventListener('click', function(event) {
    if (gameMode === 'pointing') {
        handlePointingMode(event);
    }
});

document.getElementById('restart-button').addEventListener('mouseenter', function() {
hoverSound();
});

document.querySelectorAll('.difficulty-btn').forEach(button => {
    button.addEventListener('mouseenter', function() {
        hoverSound();
    });
    button.addEventListener('click', function() {
        startGame(parseInt(this.dataset.time));
    });
});

document.getElementById('main-menu-button').addEventListener('mouseenter', function() { hoverSound(); });
document.getElementById('main-menu-button').addEventListener('click',  resetGame);

let spinCount = 0;
let requiredSpins = 0;
let lastAngle = 0;
let rotations = 0;

function startSpinMode() {
    hideAllGameModes();
    gameMode = 'spin';
    spinCount = 0;
    requiredSpins = Math.floor(Math.random() * 3) + 3;
    document.getElementById('required-spins').textContent = requiredSpins;
    document.getElementById('current-spins').textContent = spinCount;
    document.getElementById('spin-game').style.display = 'block';
    document.getElementById('keys-display').style.display = 'none';
    document.getElementById('directions-display').style.display = 'none';
    document.getElementById('point-game').style.display = 'none';
}

function handleSpinMode(event) {
    if (isGameOver) return;
    const spinArea = document.getElementById('spin-area');
    const rect = spinArea.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2
    const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
    const angleDiff = angle - lastAngle;

    if (angleDiff > 2 * Math.PI) {
        rotations--;
    } else if (angleDiff < -Math.PI) {
        rotations++;
    }

    lastAngle = angle;

    if (Math.abs(rotations) >= 1) {
        spinCount++;
        document.getElementById('current-spins').textContent = spinCount;
        rotations = 0;

if (spinCount >= requiredSpins) {
    document.getElementById('score-value').textContent = score;
    playClearSound();
    startRound();
}

    }
}

const recentModes = [];
const RECENT_MODES_TO_REMEMBER = 3;

function switchGameMode() {
    const modes = ['keys', 'directions', 'typing', 'pointing', 'color', 'ascend', 'precisionTime', 'rockPaperScissors'];
    
    if (isMobileDevice()) {
        // 모바일에서는 'spin', 'hacking' 모드 제외
        const availableModes = modes.filter(mode => mode !== 'hacking' && !recentModes.includes(mode));
        gameMode = availableModes[Math.floor(Math.random() * availableModes.length)];
    } else {
        // 데스크톱에서는 모든 모드 포함
        const allModes = [...modes, 'spin', 'hacking'];
        const availableModes = allModes.filter(mode => !recentModes.includes(mode));
        gameMode = availableModes[Math.floor(Math.random() * availableModes.length)];
    }
    
    recentModes.push(gameMode);
    if (recentModes.length > RECENT_MODES_TO_REMEMBER) {
        recentModes.shift();
    }
}


function startRound() {
    isGameOver = false; 
    createModeDisplay();
    hideAllGameModes();
    switchGameMode();
    updateGameModeDisplay();
    
    const existingButtons = document.getElementById('mobile-buttons');
    if (existingButtons) existingButtons.remove();
    const existingDirectionButtons = document.getElementById('mobile-direction-buttons');
    if (existingDirectionButtons) existingDirectionButtons.remove();
    const existingCtrlButton = document.getElementById('mobile-ctrl-button');
    if (existingCtrlButton) existingCtrlButton.remove();
    const existingSpaceBarButton = document.getElementById('mobile-spacebar-button');
    if (existingSpaceBarButton) existingSpaceBarButton.remove();

    const mobileButtonContainers = [
        'mobile-buttons',
        'mobile-direction-buttons',
        'mobile-ctrl-button',
        'mobile-hacking-buttons',
        'mobile-spacebar-button'
    ];

    mobileButtonContainers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = ''; // 버튼들을 모두 제거
        }
    });

    if (isMobileDevice()) {
        if (gameMode === 'keys') {
            createMobileButtons();
        } else if (gameMode === 'directions') {
            createDirectionButtons();
        } else if (gameMode === 'typing') {
            createCtrlButton();
        } else if (gameMode === 'precisionTime') {
            createSpaceBarButton();
        }
    }
    if (gameMode === 'keys') {
        displayKeys();
    } else if (gameMode === 'directions') {
        displayDirections();
    } else if (gameMode === 'typing') {
        startTypingMode();
    } else if (gameMode === 'color') {
        startColorGameMode();
    } else if (gameMode === 'pointing') {
        startPointingMode();
    } else if (gameMode === 'spin') {
        startSpinMode();
    } else if (gameMode === 'ascend') {
        startAscendMode();
    } else if (gameMode === 'hacking') {
        startHackingMode();
    } else if (gameMode === 'precisionTime') {
        startPrecisionTimeMode();
    } else if (gameMode === 'rockPaperScissors') {
        startRockPaperScissorsMode();
    }
    
    resetTimerBar();
    roundStartTime = Date.now();
    clearTimeout(window.roundTimer);
    window.roundTimer = setTimeout(gameOver, timeLimit);
    score += difficultyScores[currentDifficulty];
    document.getElementById('score-value').textContent = score;
}



document.getElementById('spin-area').addEventListener('mousemove', function(event) {
    if (gameMode === 'spin') {
        handleSpinMode(event);
    }
});

function displayGameMode() {
    const modeDisplay = document.createElement('div');
    modeDisplay.id = 'mode-display';
    modeDisplay.style.position = 'absolute';
    modeDisplay.style.top = '10px';
    modeDisplay.style.left = '50%';
    modeDisplay.style.transform = 'translateX(-50%)';
    modeDisplay.style.padding = '5px 10px';
    modeDisplay.style.backgroundColor = 'var(--retro-dark-green)';
    modeDisplay.style.color = 'var(--retro-beige)';
    modeDisplay.style.border = '2px solid var(--retro-black)';
    modeDisplay.style.fontFamily = "'Press Start 2P', cursive";
    modeDisplay.style.fontSize = '14px';
    document.body.appendChild(modeDisplay);
}

function updateGameModeDisplay() {
    const modeDisplay = document.getElementById('mode-display');
    switch(gameMode) {
        case 'keys':
            modeDisplay.textContent = 'Type!\n화면에 표시된\n알파벳을 눌러라!';
            break;
        case 'directions':
            modeDisplay.textContent = 'Direction!\n화면에 표시된 방향키를\n순서대로 눌러라!';
            break;
        case 'typing':
            modeDisplay.textContent = 'Beat!\n[Ctrl]키를 눌러라!';
            break;
        case 'pointing':
            modeDisplay.textContent = 'Catch!\n마우스로 공을 잡아라!';
            break;
        case 'spin':
            modeDisplay.textContent = 'Spin!\n마우스로 원을 그려라!';
            break;
        case 'color':
            modeDisplay.textContent = 'Color!\n다른 색 하나를 골라내라!';
            break;
        case 'ascend':
            modeDisplay.textContent = 'Ascend!\n낮은 숫자를 누른고!\n높은 숫자를 누르고!';
            break;
        case 'hacking':
            modeDisplay.textContent = 'Hacking!\n키보드를 연타해서 해킹해라!';
            break;
        case 'precisionTime':
            modeDisplay.textContent = 'Timing!\n타이밍에 맞게\n[스페이스바]를 눌러라!';
            break;
        case 'rockPaperScissors':
            modeDisplay.textContent = '가위바위보!\n지시에 따라\n[가위][바위][보]를 선택하라!';
            break;
    }
}
function playClearSound() {
    const clearSound = document.getElementById('clear-sound');
    clearSound.currentTime = 0;  // 항상 처음부터 재생
    clearSound.play().catch(error => console.log('효과음 재생 실패:', error));
}
function hoverSound() {
    const clearSound = document.getElementById('hover-sound');
    clearSound.currentTime = 0;  // 항상 처음부터 재생
    clearSound.play().catch(error => console.log('효과음 재생 실패:', error));
}
function CountdownSound() {
    const clearSound = document.getElementById('countdown-sound');
    clearSound.currentTime = 0;  // 항상 처음부터 재생
    clearSound.play().catch(error => console.log('효과음 재생 실패:', error));
}
function lostSound() {
    const clearSound = document.getElementById('lost-sound');
    clearSound.currentTime = 0;  // 항상 처음부터 재생
    clearSound.play().catch(error => console.log('효과음 재생 실패:', error));
}

function startColorGameMode() {
    hideAllGameModes();
    gameMode = 'color';
    const colorGame = document.getElementById('color-game');
    colorGame.style.display = 'grid';
    colorGame.innerHTML = ''; // 기존 타일 제거
    createColorTiles();
}


function createColorTiles() {
    const colorGame = document.getElementById('color-game');
    colorGame.innerHTML = '';
    
    const tileSize = Math.floor(150 / 3) - 5; // 150px / 3 - gap
    
    const baseColor = getRandomColor();
    const differentColor = getSlightlyDifferentColor(baseColor);
    const differentTileIndex = Math.floor(Math.random() * 9);
    
    for (let i = 0; i < 9; i++) {
        const tile = document.createElement('div');
        tile.className = 'color-tile';
        tile.style.width = `${tileSize}px`;
        tile.style.height = `${tileSize}px`;
        tile.style.backgroundColor = i === differentTileIndex ? differentColor : baseColor;
        tile.addEventListener('click', () => handleColorTileClick(i === differentTileIndex));
        colorGame.appendChild(tile);
    }
}


function getRandomColor() {
    return `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`;
}

function getSlightlyDifferentColor(baseColor) {
    const rgb = baseColor.match(/\d+/g).map(Number);
    return `rgb(${rgb[0]+10},${rgb[1]+10},${rgb[2]+10})`;
}

function handleColorTileClick(isCorrect) {
    if (isGameOver) return; 
    if (isCorrect) {
        document.getElementById('score-value').textContent = score;
        playClearSound();
        startRound();
    } else {
        gameOver();
    }
}

document.getElementById('play-button').addEventListener('click', function() {
    hoverSound();
    this.style.display = 'none';
    const difficultyButtons = document.getElementById('difficulty-buttons');
    difficultyButtons.style.display = 'flex';
    difficultyButtons.style.flexDirection = 'row';
    difficultyButtons.style.justifyContent = 'center';
    difficultyButtons.style.gap = '10px';
    
    // 버튼들을 순차적으로 나타나게 하는 애니메이션
    const buttons = difficultyButtons.getElementsByTagName('button');
    Array.from(buttons).forEach((button, index) => {
        button.style.opacity = '0';
        button.style.transform = 'translateY(20px)';
        setTimeout(() => {
            button.style.transition = 'opacity 0.5s, transform 0.5s';
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        }, index * 200);
    });
});

function createModeDisplay() {
    if (!document.getElementById('mode-display')) {
        const modeDisplay = document.createElement('div');
        modeDisplay.id = 'mode-display';
        document.body.appendChild(modeDisplay);
    }
}

let scores = JSON.parse(localStorage.getItem('scores')) || [];

document.getElementById('register-score-button').addEventListener('click', registerScore);
document.getElementById('close-leaderboard').addEventListener('click', closeLeaderboard);

function registerScore() {
    const playerName = prompt('이름을 입력하세요:');
    if (playerName) {
        const score = parseInt(document.getElementById('final-score').textContent);
        scores.push({name: playerName, score: score});
        scores.sort((a, b) => b.score - a.score);
        scores = scores.slice(0, 10);  // 상위 10개 점수만 유지
        localStorage.setItem('scores', JSON.stringify(scores));
        showLeaderboard();
    }
    document.getElementById('register-score-button').style.display = 'none';
}

function showLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    const scoreList = document.getElementById('score-list');
    scoreList.innerHTML = '';
    scores.forEach((score, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${score.name}: ${score.score}`;
        scoreList.appendChild(li);
    });
    leaderboard.style.display = 'block';
}

function closeLeaderboard() {
    document.getElementById('leaderboard').style.display = 'none';
}

let difficultyScores = {
    '6000': 10,  // 쉬움
    '3000': 20, // 보통
    '1500': 80  // 어려움
};

function updateScore(difficulty) {
    currentScore += difficultyScores[difficulty];
    document.getElementById('score').textContent = `Score: ${currentScore}`;
}

let currentVolume = 1;

function setVolume(volume) {
    currentVolume = volume;
    if (currentMusic) {
        currentMusic.volume = currentVolume;
    }
    localStorage.setItem('gameVolume', currentVolume);
}

document.getElementById('volumeControl').addEventListener('input', function() {
    setVolume(this.value);
});

// 페이지 로드 시 저장된 볼륨 설정 불러오기
window.addEventListener('load', function() {
    const savedVolume = localStorage.getItem('gameVolume');
    if (savedVolume !== null) {
        currentVolume = parseFloat(savedVolume);
        document.getElementById('volumeControl').value = currentVolume;
    }
});

function playButtonSound() {
    const sound = document.getElementById('buttonSound');
    sound.currentTime = 0;  // 소리를 처음부터 재생
    sound.play();
}

// 모든 버튼에 효과음 추가
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', playButtonSound);
});

// 튜토리얼 모듈
const TutorialModule = {
  currentStep: 0,
  steps: [
    { image: 'img/tutorial_image1.png', text: 'Type! : Type the key that appears on the screen.' },
    { image: 'img/tutorial_image2.png', text: 'Direction! : Press the arrow key in the indicated direction.' },
    { image: 'img/tutorial_image3.png', text: 'Catch! : Catch the target on the screen.' },
    { image: 'img/tutorial_image4.png', text: 'Spin! : Spin circles with the mouse. clockwise.' },
    { image: 'img/tutorial_image5.png', text: 'Color! : Click on a tile in a different color.' },
    { image: 'img/tutorial_image6.png', text: 'Beat! : Beat the [ctrl] key in a row.' },
    { image: 'img/tutorial_image7.png', text: 'Ascend! : Click from low to high.' },
    { image: 'img/tutorial_image8.png', text: 'Hacking! : Hit any keys to hack.' },
    { image: 'img/tutorial_image9.png', text: 'Timing! : Press [space bar] when it on' },
    { image: 'img/tutorial_image10.png', text: 'RockPaperScissors! : Press [Rock][Paper][Scissors] according to instructions' }
  ],
  
  start() {
    this.currentStep = 0;
    document.getElementById('tutorial-container').style.display = 'block';
    this.showStep();
  },
  
  showStep() {
    if (this.currentStep >= this.steps.length) {
      document.getElementById('tutorial-container').style.display = 'none';
      return;
    }
    
    const step = this.steps[this.currentStep];
    document.getElementById('tutorial-content').innerHTML = `
      <img src="${step.image}" alt="Tutorial step ${this.currentStep + 1}">
      <p>${step.text}</p>
    `;
  },
  
  nextStep() {
    this.currentStep++;
    this.showStep();
  },
pastStep() {
    this.currentStep--;
    if (this.currentStep < 0) { // 0 이하로 떨어진 경우
        this.close(); // 튜토리얼 창을 닫는다
    } else {
        this.showStep();
    }
}
,
  
  close() {
    document.getElementById('tutorial-container').style.display = 'none';
  }
};
document.addEventListener('DOMContentLoaded', () => {
  const tutorialButton = document.getElementById('tutorial-button');
  const nextStepButton = document.getElementById('next-step');
  const pastStepButton = document.getElementById('past-step');
  const closeTutorialButton = document.getElementById('close-tutorial');

  if (tutorialButton) {
    tutorialButton.addEventListener('click', () => TutorialModule.start());
  }

  if (nextStepButton) {
    pastStepButton.addEventListener('click', () => TutorialModule.pastStep());
  }

  if (nextStepButton) {
    nextStepButton.addEventListener('click', () => TutorialModule.nextStep());
  }

  if (closeTutorialButton) {
    closeTutorialButton.addEventListener('click', () => TutorialModule.close());
  }
});



function startAscendMode() {
    hideAllGameModes();
    gameMode = 'ascend';
    const ascendGame = document.getElementById('ascend');
    ascendGame.style.display = 'block';
    ascendClickCount = 0;  // 클릭 카운트 초기화
    createAscendPoints();
}


function createAscendPoints() {
    const ascendGame = document.getElementById('ascend');
    ascendGame.innerHTML = '';
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const points = [];
    const minDistance = 50; // 최소 거리 설정

    for (let i = 0; i < 2; i++) {
        let x, y;
        let validPosition = false;

        while (!validPosition) {
            x = Math.random() * 80 + 10;
            y = Math.random() * 80 + 10;
            validPosition = true;

            // 이미 생성된 점들과의 거리 확인
            for (let j = 0; j < points.length; j++) {
                const dx = x - points[j].x;
                const dy = y - points[j].y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < minDistance) {
                    validPosition = false;
                    break;
                }
            }
        }

        const point = document.createElement('div');
        point.className = 'ascend-point';
        point.style.left = x + '%';
        point.style.top = y + '%';
        const index = Math.floor(Math.random() * numbers.length);
        const number = numbers.splice(index, 1)[0];
        point.textContent = number;
        point.dataset.number = number;
        point.addEventListener('click', handleAscendClick);
        ascendGame.appendChild(point);
        points.push({x, y, element: point});
    }

    window.ascendOrder = points.map(p => parseInt(p.element.dataset.number)).sort((a, b) => a - b);
}



let ascendClickCount = 0;

function handleAscendClick(event) {
    if (isGameOver) return;
    const clickedNumber = parseInt(event.target.dataset.number);
    if (clickedNumber === window.ascendOrder[ascendClickCount]) {
        ascendClickCount++;
        event.target.style.backgroundColor = 'green';
        if (ascendClickCount === 2) {
            playClearSound();
            score += difficultyScores[currentDifficulty];
            document.getElementById('score-value').textContent = score;
            startRound();
        }
    } else {
        gameOver();
    }
}


let hackingCount = 0;
const hackingGoal = 30;

function startHackingMode() {
    hideAllGameModes();
    gameMode = 'hacking';
    hackingCount = 0;
    document.getElementById('hacking-display').style.display = 'block';
    updateHackingDisplay();
}
function updateHackingDisplay() {
    const progress = (hackingCount / hackingGoal) * 100;
    document.getElementById('hacking-progress').style.width = `${progress}%`;
    document.getElementById('hacking-display').textContent = `Hack Progress: ${hackingCount}/${hackingGoal}`;
}

function createHackingEffect() {
    const effect = document.createElement('div');
    effect.textContent = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    effect.style.position = 'fixed';
    effect.style.left = Math.random() * window.innerWidth + 'px';
    effect.style.top = Math.random() * window.innerHeight + 'px';
    effect.style.color = '#00ff00'; // 더 밝은 초록색
    effect.style.textShadow = '0 0 5px #00ff00, 0 0 10px #00ff00'; // 글로우 효과
    effect.style.fontSize = '30px'; // 더 큰 폰트 크기
    effect.style.fontWeight = 'bold'; // 굵은 글씨
    effect.style.fontFamily = '"Courier New", monospace';
    effect.style.zIndex = '9999'; // 항상 최상위에 표시
    document.body.appendChild(effect);
    
    // 페이드 아웃 애니메이션
    let opacity = 1;
    const fadeOut = setInterval(() => {
        opacity -= 0.1;
        effect.style.opacity = opacity;
        if (opacity <= 0) {
            clearInterval(fadeOut);
            effect.remove();
        }
    }, 50);
}

document.getElementById('fullscreen').addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
});


function createSpaceBarButton() {
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'mobile-spacebar-button';
    buttonContainer.style.position = 'fixed';
    buttonContainer.style.bottom = '20px';
    buttonContainer.style.left = '0';
    buttonContainer.style.width = '100%';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';

const button = document.createElement('button');
button.textContent = 'SPACE';
button.classList.add('mobile-button');
button.classList.add('pressed'); // 버튼 클릭 시 'pressed' 클래스 추가
button.style.padding = '15px 50px';
button.style.fontSize = '20px';
button.style.backgroundColor = 'var(--retro-dark-green)'; // 레트로 스타일의 색상 적용
button.style.color = 'var(--retro-beige)';
button.style.border = '2px solid var(--retro-black)';
button.style.borderRadius = '0'; // 사각형 버튼 모양
button.style.boxShadow = '3px 3px 0 var(--retro-black)';
button.addEventListener('click', () => {
    handlePrecisionTimeSpacePress();
    playButtonSound();
    button.classList.add('pressed');
    setTimeout(() => button.classList.remove('pressed'), 200);
});


    
    buttonContainer.appendChild(button);
    document.body.appendChild(buttonContainer);
}

function handlePrecisionTimeSpacePress() {
    const cursor = document.getElementById('pt-cursor');
    const target = document.getElementById('pt-target');
    const cursorRect = cursor.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    
    if (cursorRect.right > targetRect.left && cursorRect.left < targetRect.right) {
        playClearSound();
        score += difficultyScores[currentDifficulty];
        document.getElementById('score-value').textContent = score;
        document.getElementById('precision-time-game').stopAnimation();
        startRound();
    } else {
        document.getElementById('precision-time-game').stopAnimation();
        gameOver();
    }
}

function startPrecisionTimeMode() {
    hideAllGameModes();
    gameMode = 'precisionTime';
    document.getElementById('precision-time-game').style.display = 'block';
    createPrecisionTimeGame();
}

function createPrecisionTimeGame() {
    let targetWidth, speed;
    switch(currentDifficulty) {
        case 6000: // 쉬움
            targetWidth = 70;
            speed = 3;
            break;
        case 3000: // 보통
            targetWidth = 50;
            speed = 4;
            break;
        case 1500: // 어려움
            targetWidth = 30;
            speed = 5;
            break;
    }
    
    const game = document.getElementById('precision-time-game');
    game.innerHTML = `
        <div id="pt-bar">
            <div id="pt-cursor"></div>
            <div id="pt-target"></div>
        </div>
    `;
    const bar = document.getElementById('pt-bar');
    const cursor = document.getElementById('pt-cursor');
    const target = document.getElementById('pt-target');
    
    target.style.width = targetWidth + 'px';
    
    const barWidth = bar.offsetWidth;
    
    target.style.left = (Math.random() * (barWidth - targetWidth)) + 'px';
    
    let position = 0;
    let animationId;
    const animateCursor = () => {
        position += speed;
        if (position > barWidth) position = -targetWidth;
        cursor.style.left = position + 'px';
        animationId = requestAnimationFrame(animateCursor);
    };
    animationId = requestAnimationFrame(animateCursor);
    
    // 애니메이션 정지 함수 추가
    game.stopAnimation = () => {
        cancelAnimationFrame(animationId);
    };
}


function handlePrecisionTimeKeyPress(event) {
    if (event.code === 'Space') {
        const cursor = document.getElementById('pt-cursor');
        const target = document.getElementById('pt-target');
        const cursorRect = cursor.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        
        if (cursorRect.right > targetRect.left && cursorRect.left < targetRect.right) {
            playClearSound();
            score += difficultyScores[currentDifficulty];
            document.getElementById('score-value').textContent = score;
            document.getElementById('precision-time-game').stopAnimation();
            startRound();
        } else {
            document.getElementById('precision-time-game').stopAnimation();
            gameOver();
        }
    }
}

document.addEventListener('keydown', (event) => {
    if (gameMode === 'precisionTime') {
        handlePrecisionTimeKeyPress(event);
    }
});


document.getElementById('play-button').addEventListener('click', startLogoAnimation);

function startLogoAnimation() {
  const logoAnimation = document.getElementById('logo-animation');
  logoAnimation.style.display = 'flex';
  
  const gameSound = new Audio('sounds/game_sound.mp3');
  const focusSound = new Audio('sounds/focus_sound.mp3');
  
  anime.timeline({
    easing: 'easeInOutQuad',
    complete: function() {
      setTimeout(() => {
        anime({
          targets: '#logo-animation',
          opacity: [1, 0],
          duration: 1000,
          easing: 'easeOutQuad',
          complete: function() {
            logoAnimation.style.display = 'none';
            document.getElementById('difficulty-buttons').style.display = 'flex';
          }
        });
      }, 1000);
    }
  })
  .add({
    targets: '#FOCUS',
    filter: ['blur(10px)', 'blur(0px)'],
    opacity: [0, 1],
    duration: 2000,
    begin: function() {
      gameSound.play();
    }
  })
  .add({
    targets: '#GAME',
    opacity: [0, 1],
    duration: 2000,
    begin: function() {
      focusSound.play();
    }
  }, '-=1000'); // FOCUS 애니메이션을 GAME 애니메이션 1초 후에 시작
}

function startRockPaperScissorsMode() {
hideAllGameModes();
gameMode = 'rockPaperScissors';
const choices = ['rock', 'paper', 'scissors'];
const instructions = ['이겨라', '져라', '비겨라'];


const computerChoice = choices[Math.floor(Math.random() * 3)];
const instruction = instructions[Math.floor(Math.random() * 3)];

const rpsGame = document.getElementById('rps-game');
rpsGame.style.display = 'flex';

    if (isMobileDevice()) {
        rpsGame.style.flexDirection = 'column'; 
        rpsGame.style.alignItems = 'center';
        
        const rpsButtons = document.getElementById('rps-buttons');
        rpsButtons.style.flexDirection = 'column';
        rpsButtons.style.gap = '10px';
       }

document.getElementById('rps-display').textContent = computerChoice;
document.getElementById('rps-instruction').textContent = instruction;

document.querySelectorAll('#rps-buttons button').forEach(button => {
    button.onclick = (e) => handleRPSChoice(e.target.id, computerChoice, instruction);
});

resetTimerBar();
// 타이머 설정 부분 제거
}


function handleRPSChoice(playerChoice, computerChoice, instruction) {
    // clearTimeout 제거 (타이머를 여기서 관리하지 않음)
    let result;
    if (playerChoice === computerChoice) {
        result = 'draw';
    } else if (
        (playerChoice === 'rock' && computerChoice === 'scissors') ||
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === 'scissors' && computerChoice === 'paper')
    ) {
        result = 'win';
    } else {
        result = 'lose';
    }
    
    if (
        (instruction === '이겨라' && result === 'win') ||
        (instruction === '져라' && result === 'lose') ||
        (instruction === '비겨라' && result === 'draw')
    ) {
        score += difficultyScores[currentDifficulty];
        document.getElementById('score-value').textContent = score;
        playClearSound();
        startRound();
    } else {
        gameOver();
    }
}
