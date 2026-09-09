const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");

const nextCanvas =
    document.getElementById("nextCanvas");

const nextCtx =
    nextCanvas.getContext("2d");

const scoreEl =
    document.getElementById("score");

const feverValueEl =
    document.getElementById("feverValue");

const feverBarFill =
    document.getElementById("feverBarFill");

const sanemiFace =
    document.getElementById("sanemiFace");

const sanemiMessage =
    document.getElementById("sanemiMessage");

const sanemiEffects =
    document.getElementById("sanemiEffects");

const giyuFace =
    document.getElementById("giyuFace");

// ========================================
// GIYU HEART EFFECT ROOT
// 義勇の周囲に❤️などを飛ばすための置き場
// ========================================

const giyuEffects =
    document.getElementById("giyuEffects");

const giyuMessage =
    document.getElementById("giyuMessage");

const eventMessage =
    document.getElementById("eventMessage");

const giyuCard =
    document.querySelector(".tomioka-card");

const giyuAttackOverlay =
    document.getElementById("giyuAttackOverlay");

const giyuAttackMessage =
    document.getElementById("giyuAttackMessage");

const giyuAttackMessageText =
    document.getElementById("giyuAttackMessageText");

const feverStartMessage =
    document.getElementById("feverStartMessage");

const startMessage =
    document.getElementById("startMessage");

const waterFlash =
    document.getElementById("waterFlash");

const waterEffects =
    document.getElementById("waterEffects");

const sanemiGameOverOverlay =
    document.getElementById("sanemiGameOverOverlay");

const gameOverPanel =
    document.getElementById("gameOverPanel");

const restartBtn =
    document.getElementById("restartBtn");

const pausePanel =
    document.getElementById("pausePanel");

const pauseBtn =
    document.getElementById("pauseBtn");

const startGate =
    document.getElementById("startGate");

const startGameBtn =
    document.getElementById("startGameBtn");


// ========================================
// CHARACTER IMAGES
// ========================================

const CHARACTER_IMAGES = {

    giyu: {

        normal:
            "images/giyu-normal.png",

        attack:
            "images/giyu-attack.png",

        happy:
            "images/giyu-happy.png"
    },

    sanemi: {

        normal:
            "images/sanemi-normal.png",

        happy:
            "images/sanemi-happy.png",

        danger:
            "images/sanemi-danger.png",

        angry:
            "images/sanemi-angry.png",

        gameover:
            "images/sanemi-gameover.png"
    }
};


function setGiyuImage(state) {

    const src =
        CHARACTER_IMAGES.giyu[state];

    if (!src) {
        return;
    }

    giyuFace.src =
        src;
}


function setSanemiImage(state) {

    const src =
        CHARACTER_IMAGES.sanemi[state];

    if (!src) {
        return;
    }

    sanemiFace.src =
        src;

    sanemiFace.classList.remove(
        "angry"
    );

    if (
        state === "angry"
    ) {

        sanemiFace.classList.add(
            "angry"
        );
    }
}


// ========================================
// AUDIO
// ========================================

const clearSe =
    document.getElementById("clearSe");

const giyuSe =
    document.getElementById("giyuSe");

const gameOverSe =
    document.getElementById("gameOverSe");

const bgmMain =
    document.getElementById("bgmMain");


let audioUnlocked =
    false;

let audioWarmed =
    false;


// ========================================
// CONSTANT
// ========================================

const COLS = 6;
const ROWS = 12;
const CELL = 50;
const EMPTY = 0;

const START_DROP_INTERVAL =
    600;

const MIN_DROP_INTERVAL =
    235;

const DANGER_NORMAL =
    0;

const DANGER_CAUTION =
    1;

const DANGER_HIGH =
    2;

const FEVER_MAX =
    100;

const FEVER_DURATION =
    8000;


// ========================================
// OHAGI
// ========================================

const OHAGI_TYPES = [

    {
        id: 1,
        name: "あんこ",
        color: "#a96f4f",
        inner: "#75432f"
    },

    {
        id: 2,
        name: "きなこ",
        color: "#d9a947",
        inner: "#f1d48f"
    },

    {
        id: 3,
        name: "ずんだ",
        color: "#83a84c",
        inner: "#b9d77b"
    },

    {
        id: 4,
        name: "ごま",
        color: "#292929",
        inner: "#111111"
    }
];


// ========================================
// STATE
// ========================================

let board;
let currentPair;
let nextPair;

let score =
    0;

let gameOver =
    false;

let resolving =
    false;

let paused =
    false;

let starting =
    false;

let waitingForUserStart =
    true;

let lastDropTime =
    0;

let dropInterval =
    START_DROP_INTERVAL;

let gameStartTime =
    0;

let dangerLevel =
    DANGER_NORMAL;

let nextGiyuAttackAt =
    0;

let fever =
    0;

let feverActive =
    false;

let feverTimer =
    null;

let reactionTimer =
    null;

let sanemiEffectMode =
    "normal";

let sanemiEffectTimer =
    null;

let giyuGameOverHeartTimer =
    null;

let sanemiGameOverPoyaTimer =
    null;

// ========================================
// AUDIO CONTROL
// ========================================

async function warmAudioElement(audio) {

    if (!audio) {
        return;
    }

    const oldVolume =
        audio.volume;

    const oldMuted =
        audio.muted;

    try {

        audio.muted =
            true;

        audio.volume =
            0;

        audio.currentTime =
            0;

        await audio.play();

        audio.pause();

        audio.currentTime =
            0;

    } catch (_) {
        // Safariで無音ウォームアップできない要素があっても続行
    }

    audio.muted =
        oldMuted;

    audio.volume =
        oldVolume;
}


function unlockAudio() {

    if (
        audioUnlocked
    ) {

        playBgm();
        return;
    }

    audioUnlocked =
        true;

    /*
    iPhone Safari では audio.play() の Promise を
    開始処理で await すると、読み込み待ちでゲーム開始自体が
    止まることがある。

    先に BGM を開始し、SE のウォームアップは非同期で流す。
    */
    playBgm();

    if (
        !audioWarmed
    ) {

        audioWarmed =
            true;

        warmAudioElement(clearSe);
        warmAudioElement(giyuSe);
        warmAudioElement(gameOverSe);
    }
}


function playBgm() {
    if (gameOver || paused || !audioUnlocked || !bgmMain) {
        return;
    }

    bgmMain.volume = 0.22;
    bgmMain.loop = true;

    const playPromise = bgmMain.play();

    if (playPromise) {
        playPromise.catch(error => {
            console.error("BGM play failed:", error);
        });
    }
}


function pauseBgm() {

    if (
        bgmMain &&
        !bgmMain.paused
    ) {

        bgmMain.pause();
    }
}


function stopBgm() {

    if (!bgmMain) {
        return;
    }

    bgmMain.pause();

    bgmMain.currentTime =
        0;

    bgmMain.playbackRate =
        1;
}


function updateBgmPitch() {

    if (!bgmMain) {
        return;
    }

    const seconds =
        getElapsedSeconds();

    let rate;

    if (
        seconds < 60
    ) {

        rate =
            1 +
            seconds *
            0.0008;

    } else if (
        seconds < 100
    ) {

        rate =
            1.05 +
            (
                seconds -
                60
            ) *
            0.0015;

    } else {

        rate =
            1.11 +
            (
                seconds -
                100
            ) *
            0.001;
    }

    if (
        feverActive
    ) {

        rate +=
            0.055;
    }

    bgmMain.playbackRate =
        Math.min(
            1.30,
            rate
        );
}


function playClearSe(cleared) {

    if (!clearSe) {
        return;
    }

    clearSe.pause();

    clearSe.currentTime =
        0;

    let rate =
        1;

    if (
        cleared >= 7
    ) {

        rate =
            1.22;

    } else if (
        cleared >= 5
    ) {

        rate =
            1.11;
    }

    if (
        feverActive
    ) {

        rate +=
            0.09;
    }

    clearSe.playbackRate =
        Math.min(
            1.40,
            rate
        );

    clearSe
        .play()
        .catch(() => { });
}


function playGiyuSe() {

    if (!giyuSe) {
        return;
    }

    giyuSe.pause();

    giyuSe.currentTime =
        0;

    giyuSe
        .play()
        .catch(() => { });
}


function playGameOverSe() {

    if (!gameOverSe) {
        return;
    }

    gameOverSe.pause();

    gameOverSe.currentTime =
        0;

    gameOverSe.volume =
        1;

    gameOverSe
        .play()
        .catch(() => { });
}


// ========================================
// SANEMI EFFECTS
// ========================================

function clearSanemiEffects() {

    clearInterval(
        sanemiEffectTimer
    );

    sanemiEffectTimer =
        null;

    if (
        sanemiEffects
    ) {

        sanemiEffects.innerHTML =
            "";
    }


}


function createCharacterEffect(
    icon,
    className,
    x,
    y
) {

    if (
        !sanemiEffects
    ) {
        return;
    }

    const el =
        document.createElement(
            "span"
        );

    el.className =
        `character-effect ${className}`;

    el.textContent =
        icon;

    el.style.left =
        `${x}%`;

    el.style.top =
        `${y}%`;

    el.style.setProperty(
        "--float-x",
        `${(Math.random() - 0.5) * 34}px`
    );

    el.style.setProperty(
        "--rotate",
        `${-20 + Math.random() * 40}deg`
    );

    sanemiEffects.appendChild(
        el
    );

    setTimeout(
        () => el.remove(),
        1300
    );
}


function spawnSanemiEffects(mode) {

    if (
        !sanemiEffects
    ) {
        return;
    }

    if (
        mode === "happy"
    ) {

        createCharacterEffect(
            "❤️",
            "heart",
            18,
            48
        );

        createCharacterEffect(
            "❤️",
            "heart",
            81,
            32
        );

        return;
    }

    if (
        mode === "danger"
    ) {

        createCharacterEffect(
            "💦",
            "sweat",
            78,
            21
        );

        createCharacterEffect(
            "💦",
            "sweat",
            88,
            45
        );

        return;
    }

    if (
        mode === "angry"
    ) {

        createCharacterEffect(
            "💢",
            "anger",
            18,
            18
        );

        createCharacterEffect(
            "💢",
            "anger",
            82,
            31
        );

        return;
    }

    if (
        mode === "bonus"
    ) {

        createCharacterEffect(
            "❤️",
            "heart",
            12,
            51
        );

        createCharacterEffect(
            "❤️",
            "heart",
            86,
            39
        );

        createCharacterEffect(
            "✨",
            "sparkle",
            22,
            18
        );

        createCharacterEffect(
            "✨",
            "sparkle",
            76,
            12
        );

        createCharacterEffect(
            "✨",
            "sparkle",
            92,
            63
        );
    }
}


function setSanemiEffectMode(mode) {

    if (
        sanemiEffectMode === mode &&
        sanemiEffectTimer
    ) {

        return;
    }

    clearSanemiEffects();

    sanemiEffectMode =
        mode;

    if (
        mode === "normal"
    ) {

        return;
    }

    spawnSanemiEffects(
        mode
    );

    let interval =
        900;

    if (
        mode === "happy"
    ) {

        interval =
            900;
    }

    if (
        mode === "danger"
    ) {

        interval =
            730;
    }

    if (
        mode === "angry"
    ) {

        interval =
            520;
    }

    if (
        mode === "bonus"
    ) {

        interval =
            540;
    }

    sanemiEffectTimer =
        setInterval(
            () => {

                spawnSanemiEffects(
                    mode
                );

            },
            interval
        );
}

// ========================================
// WATER EFFECT
// ========================================

function triggerWaterFlash() {

    if (!waterFlash) {
        return;
    }

    waterFlash.classList.remove(
        "show"
    );

    void waterFlash.offsetWidth;

    waterFlash.classList.add(
        "show"
    );

    setTimeout(
        () => {

            waterFlash.classList.remove(
                "show"
            );

        },
        500
    );
}


function createWaterBurst(
    x,
    y,
    count = 20,
    power = 1
) {

    if (
        !waterEffects
    ) {
        return;
    }

    for (
        let i = 0;
        i < count;
        i++
    ) {

        const particle =
            document.createElement(
                "span"
            );

        particle.className =
            "water-particle";

        const size =
            5 +
            Math.random() *
            13 *
            power;

        particle.style.width =
            `${size}px`;

        particle.style.height =
            `${size * 1.45}px`;

        particle.style.left =
            `${x}px`;

        particle.style.top =
            `${y}px`;

        const angle =
            Math.random() *
            Math.PI *
            2;

        const distance =
            (
                70 +
                Math.random() *
                150
            ) *
            power;

        const dx =
            Math.cos(angle) *
            distance;

        const dy =
            Math.sin(angle) *
            distance -
            30 *
            power;

        particle.style.setProperty(
            "--dx",
            `${dx}px`
        );

        particle.style.setProperty(
            "--dy",
            `${dy}px`
        );

        particle.style.setProperty(
            "--rotate",
            `${Math.random() * 260}deg`
        );

        particle.style.setProperty(
            "--duration",
            `${550 + Math.random() * 420}ms`
        );

        waterEffects.appendChild(
            particle
        );

        setTimeout(
            () => particle.remove(),
            1100
        );
    }

    const ring =
        document.createElement(
            "span"
        );

    ring.className =
        "water-ring";

    ring.style.left =
        `${x}px`;

    ring.style.top =
        `${y}px`;

    waterEffects.appendChild(
        ring
    );

    setTimeout(
        () => ring.remove(),
        800
    );
}


function burstWaterAroundBoard(
    count = 28
) {

    const rect =
        canvas.getBoundingClientRect();

    createWaterBurst(
        rect.left +
        rect.width / 2,

        rect.top +
        rect.height *
        0.42,

        count,
        1.15
    );
}


// ========================================
// STRONG WATER SPLASH
// 義勇アタック開始時の大きな水しぶき
// ========================================

function spawnWaterBurst(
    x = window.innerWidth / 2,
    y = window.innerHeight * 0.42,
    count = 26
) {

    if (!waterEffects) {
        return;
    }

    for (
        let i = 0;
        i < count;
        i++
    ) {

        const particle =
            document.createElement(
                "div"
            );

        particle.className =
            "water-particle";

        const size =
            7 +
            Math.random() *
            16;

        const angle =
            (-Math.PI * 0.9) +
            Math.random() *
            (
                Math.PI *
                1.8
            );

        const distance =
            70 +
            Math.random() *
            180;

        const dx =
            Math.cos(
                angle
            ) *
            distance;

        const dy =
            Math.sin(
                angle
            ) *
            distance *
            0.72 -
            Math.random() *
            28;

        particle.style.left =
            `${x}px`;

        particle.style.top =
            `${y}px`;

        particle.style.width =
            `${size}px`;

        particle.style.height =
            `${size *
            (
                1.1 +
                Math.random() *
                1.1
            )
            }px`;

        particle.style.setProperty(
            "--dx",
            `${dx}px`
        );

        particle.style.setProperty(
            "--dy",
            `${dy}px`
        );

        particle.style.setProperty(
            "--rotate",
            `${-80 +
            Math.random() *
            160
            }deg`
        );

        particle.style.setProperty(
            "--duration",
            `${0.45 +
            Math.random() *
            0.28
            }s`
        );

        waterEffects.appendChild(
            particle
        );

        particle.addEventListener(
            "animationend",
            () =>
                particle.remove(),
            {
                once: true
            }
        );
    }
}


// ========================================
// SPECIAL MESSAGE
// ========================================

function showGiyuAttackMessage(text) {

    if (
        !giyuAttackMessage ||
        !giyuAttackMessageText
    ) {

        return;
    }

    giyuAttackMessageText.textContent =
        text;

    giyuAttackMessage.classList.remove(
        "show"
    );

    void giyuAttackMessage.offsetWidth;

    giyuAttackMessage.classList.add(
        "show"
    );

    setTimeout(
        () => {

            giyuAttackMessage.classList.remove(
                "show"
            );

        },
        1860
    );
}


function showFeverStartMessage() {

    if (
        !feverStartMessage
    ) {
        return;
    }

    feverStartMessage.classList.remove(
        "show"
    );

    void feverStartMessage.offsetWidth;

    feverStartMessage.classList.add(
        "show"
    );

    setTimeout(
        () => {

            feverStartMessage.classList.remove(
                "show"
            );

        },
        2700
    );
}


function showStartMessage() {

    if (
        !startMessage
    ) {
        return;
    }

    startMessage.classList.remove(
        "show"
    );

    void startMessage.offsetWidth;

    startMessage.classList.add(
        "show"
    );

    setTimeout(
        () => {

            startMessage.classList.remove(
                "show"
            );

        },
        1700
    );
}


// ========================================
// GENERIC CHARACTER EFFECTS
// 義勇・実弥どちらにも使える単発エフェクト
// ========================================

function spawnCharacterEffect(
    root,
    type,
    count = 1
) {

    if (!root) {
        return;
    }

    const iconMap = {

        heart:
            "❤️",

        sweat:
            "💦",

        anger:
            "💢",

        sparkle:
            "✨"
    };

    const basePositions = [

        {
            left: 22,
            top: 18
        },

        {
            left: 50,
            top: 10
        },

        {
            left: 78,
            top: 22
        },

        {
            left: 30,
            top: 34
        },

        {
            left: 68,
            top: 36
        }
    ];

    for (
        let i = 0;
        i < count;
        i++
    ) {

        const effect =
            document.createElement(
                "span"
            );

        effect.className =
            `character-effect ${type}`;

        effect.textContent =
            iconMap[type] ||
            "✨";

        const base =
            basePositions[
            i %
            basePositions.length
            ];

        const offsetX =
            (
                Math.random() -
                0.5
            ) *
            18;

        const offsetY =
            (
                Math.random() -
                0.5
            ) *
            12;

        effect.style.left =
            `calc(${base.left}% + ${offsetX}px)`;

        effect.style.top =
            `calc(${base.top}% + ${offsetY}px)`;

        effect.style.setProperty(
            "--float-x",
            `${(
                Math.random() -
                0.5
            ) *
            50
            }px`
        );

        effect.style.setProperty(
            "--rotate",
            `${-16 +
            Math.random() *
            32
            }deg`
        );

        root.appendChild(
            effect
        );

        effect.addEventListener(
            "animationend",
            () =>
                effect.remove(),

            {
                once: true
            }
        );
    }
}


function clearGiyuEffects() {

    if (
        !giyuEffects
    ) {

        return;
    }

    giyuEffects.innerHTML =
        "";
}


// ========================================
// GIYU HEART
// 「よかった」で義勇から❤️
// ========================================

function showGiyuHeartBurst(
    count = 4
) {

    spawnCharacterEffect(
        giyuEffects,
        "heart",
        count
    );
}


// ========================================
// GIYU GAME OVER HEART LOOP
// ゲームオーバー中、義勇の❤️をずっと飛ばす
// ========================================

function startGiyuGameOverHearts() {

    stopGiyuGameOverHearts();

    showGiyuHeartBurst(
        4
    );

    giyuGameOverHeartTimer =
        setInterval(
            () => {

                if (
                    !gameOver
                ) {

                    stopGiyuGameOverHearts();

                    return;
                }

                showGiyuHeartBurst(
                    3
                );

            },
            850
        );
}


function stopGiyuGameOverHearts() {

    clearInterval(
        giyuGameOverHeartTimer
    );

    giyuGameOverHeartTimer =
        null;
}


// ========================================
// SANEMI GAME OVER POYA EFFECT
// 満腹でぽやぽやしている感じのエフェクト
// ========================================

function createSanemiPoyaEffect(
    icon,
    x,
    y,
    className
) {

    if (
        !sanemiEffects
    ) {

        return;
    }

    const el =
        document.createElement(
            "span"
        );

    el.className =
        `character-effect ${className}`;

    el.textContent =
        icon;

    el.style.left =
        `${x}%`;

    el.style.top =
        `${y}%`;

    el.style.setProperty(
        "--float-x",
        `${(
            Math.random() -
            0.5
        ) *
        34
        }px`
    );

    el.style.setProperty(
        "--rotate",
        `${-12 +
        Math.random() *
        24
        }deg`
    );

    sanemiEffects.appendChild(
        el
    );

    setTimeout(
        () =>
            el.remove(),
        2100
    );
}


function spawnSanemiGameOverPoya() {

    if (
        !gameOver
    ) {

        return;
    }

    createSanemiPoyaEffect(
        "○",
        20,
        28,
        "poya"
    );

    createSanemiPoyaEffect(
        "○",
        78,
        18,
        "poya-small"
    );

    createSanemiPoyaEffect(
        "✦",
        86,
        46,
        "poya-sparkle"
    );
}


function startSanemiGameOverPoya() {

    stopSanemiGameOverPoya();

    spawnSanemiGameOverPoya();

    sanemiGameOverPoyaTimer =
        setInterval(
            () => {

                if (
                    !gameOver
                ) {

                    stopSanemiGameOverPoya();

                    return;
                }

                spawnSanemiGameOverPoya();

            },
            1050
        );
}


function stopSanemiGameOverPoya() {

    clearInterval(
        sanemiGameOverPoyaTimer
    );

    sanemiGameOverPoyaTimer =
        null;
}


// ========================================
// FEVER
// ========================================

function getFeverGain(cleared) {

    if (
        cleared >= 7
    ) {

        return 48;
    }

    if (
        cleared >= 5
    ) {

        return 36;
    }

    return 28;
}


function addFever(amount) {

    if (
        feverActive ||
        gameOver
    ) {

        return;
    }

    fever =
        Math.min(
            FEVER_MAX,
            fever +
            amount
        );

    updateFeverUI();

    if (
        fever >=
        FEVER_MAX
    ) {

        activateFever();
    }
}


function activateFever() {

    if (
        feverActive ||
        gameOver
    ) {

        return;
    }

    feverActive =
        true;

    fever =
        FEVER_MAX;

    if (
        giyuAttackMessage
    ) {

        giyuAttackMessage.classList.remove(
            "show"
        );
    }

    if (
        giyuAttackOverlay
    ) {

        giyuAttackOverlay.classList.remove(
            "show"
        );
    }

    canvas.classList.remove(
        "attacking"
    );

    if (
        giyuCard
    ) {

        giyuCard.classList.remove(
            "attacking-card"
        );
    }

    document.body.classList.add(
        "fever-active"
    );

    setSanemiImage(
        "happy"
    );

    sanemiFace.classList.add(
        "happy"
    );

    sanemiMessage.textContent =
        "うめェェ！！";

    setSanemiEffectMode(
        "bonus"
    );

    setGiyuImage(
        "happy"
    );

    giyuMessage.textContent =
        "よかった";

    showFeverStartMessage();

    triggerClearFlash();

    bounceScore();

    showFeverSparkles(
        16,
        true
    );

    updateFeverUI();

    clearTimeout(
        feverTimer
    );

    feverTimer =
        setTimeout(
            endFever,
            FEVER_DURATION
        );
}


function endFever() {

    if (
        gameOver
    ) {
        return;
    }

    feverActive =
        false;

    fever =
        0;

    document.body.classList.remove(
        "fever-active"
    );

    sanemiFace.classList.remove(
        "happy",
        "fever-jump"
    );

    restoreCharacters();

    scheduleNextGiyuAttack();

    updateFeverUI();
}


function updateFeverUI() {

    feverValueEl.textContent =
        feverActive
            ? "FEVER!"
            : `${Math.floor(fever)}%`;

    feverBarFill.style.width =
        feverActive
            ? "100%"
            : `${fever}%`;
}


// ========================================
// SCORE EFFECT
// ========================================

function bounceScore() {

    scoreEl.classList.remove(
        "score-pop"
    );

    void scoreEl.offsetWidth;

    scoreEl.classList.add(
        "score-pop"
    );
}


function showScorePopup(
    points,
    big = false
) {

    const popup =
        document.createElement(
            "div"
        );

    popup.className =
        "score-popup";

    if (
        big
    ) {

        popup.classList.add(
            "big"
        );
    }

    if (
        feverActive
    ) {

        popup.classList.add(
            "fever-score"
        );

        popup.textContent =
            `+${points}!!`;

    } else {

        popup.textContent =
            `+${points}`;
    }

    const rect =
        canvas.getBoundingClientRect();

    popup.style.left =
        `${rect.left +
        rect.width /
        2
        }px`;

    popup.style.top =
        `${rect.top +
        rect.height *
        0.45
        }px`;

    document.body.appendChild(
        popup
    );

    setTimeout(
        () =>
            popup.remove(),
        1050
    );
}


function showFeverSparkles(
    amount = 8,
    big = false
) {

    const rect =
        scoreEl.getBoundingClientRect();

    const centerX =
        rect.left +
        rect.width /
        2;

    const centerY =
        rect.top +
        rect.height /
        2;

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const sparkle =
            document.createElement(
                "span"
            );

        sparkle.className =
            "fever-sparkle";

        if (
            big &&
            i % 3 === 0
        ) {

            sparkle.classList.add(
                "big"
            );
        }

        sparkle.textContent =
            i % 3 === 0
                ? "✦"
                : i % 3 === 1
                    ? "✨"
                    : "★";

        sparkle.style.left =
            `${centerX}px`;

        sparkle.style.top =
            `${centerY}px`;

        sparkle.style.setProperty(
            "--dx",
            `${(
                Math.random() -
                0.5
            ) *
            (
                big
                    ? 160
                    : 100
            )
            }px`
        );

        sparkle.style.setProperty(
            "--dy",
            `${-30 -
            Math.random() *
            (
                big
                    ? 125
                    : 75
            )
            }px`
        );

        sparkle.style.setProperty(
            "--rotate",
            `${-90 +
            Math.random() *
            180
            }deg`
        );

        document.body.appendChild(
            sparkle
        );

        setTimeout(
            () =>
                sparkle.remove(),
            850
        );
    }
}

function jumpSanemiOnFever() {

    if (
        !feverActive ||
        gameOver
    ) {

        return;
    }

    sanemiFace.classList.remove(
        "happy",
        "fever-jump"
    );

    void sanemiFace.offsetWidth;

    sanemiFace.classList.add(
        "fever-jump"
    );

    setTimeout(
        () => {

            if (
                feverActive &&
                !gameOver
            ) {

                sanemiFace.classList.remove(
                    "fever-jump"
                );

                sanemiFace.classList.add(
                    "happy"
                );
            }

        },
        420
    );
}


// ========================================
// CLEAR BONUS
// ========================================

function getClearMultiplier(cleared) {

    if (
        cleared >= 8
    ) {

        return 2.5;
    }

    if (
        cleared === 7
    ) {

        return 2.0;
    }

    if (
        cleared === 6
    ) {

        return 1.5;
    }

    if (
        cleared === 5
    ) {

        return 1.2;
    }

    return 1;
}


function showClearBonus(cleared) {

    if (
        cleared >= 8
    ) {

        showEvent(
            "🍡 おはぎ大盛り！"
        );

        return;
    }

    if (
        cleared === 7
    ) {

        showEvent(
            "GREAT!"
        );

        return;
    }

    if (
        cleared === 6
    ) {

        showEvent(
            "NICE!"
        );

        return;
    }

    if (
        cleared === 5
    ) {

        showEvent(
            "GOOD!"
        );
    }
}


// ========================================
// BOARD
// ========================================

function createBoard() {

    return Array.from(
        {
            length:
                ROWS
        },

        () =>
            Array(
                COLS
            ).fill(
                EMPTY
            )
    );
}


function randomOhagi() {

    return (
        1 +
        Math.floor(
            Math.random() *
            OHAGI_TYPES.length
        )
    );
}


function createPair() {

    return {

        x: 2,

        y: 0,

        direction: 0,

        main:
            randomOhagi(),

        sub:
            randomOhagi()
    };
}


function getSubPosition(pair) {

    const directions = [

        {
            x: 0,
            y: -1
        },

        {
            x: 1,
            y: 0
        },

        {
            x: 0,
            y: 1
        },

        {
            x: -1,
            y: 0
        }
    ];

    const d =
        directions[
        pair.direction
        ];

    return {

        x:
            pair.x +
            d.x,

        y:
            pair.y +
            d.y
    };
}


function isCellFree(
    x,
    y
) {

    if (
        x < 0 ||
        x >= COLS
    ) {

        return false;
    }

    if (
        y >= ROWS
    ) {

        return false;
    }

    if (
        y < 0
    ) {

        return true;
    }

    return (
        board[y][x] ===
        EMPTY
    );
}


function canPlace(pair) {

    if (!pair) {
        return false;
    }

    const sub =
        getSubPosition(
            pair
        );

    return (
        isCellFree(
            pair.x,
            pair.y
        )
        &&
        isCellFree(
            sub.x,
            sub.y
        )
    );
}


// ========================================
// MOVE
// ========================================

function movePair(
    dx,
    dy
) {

    if (
        !currentPair ||
        gameOver ||
        resolving ||
        paused ||
        starting
    ) {

        return false;
    }

    const moved = {

        ...currentPair,

        x:
            currentPair.x +
            dx,

        y:
            currentPair.y +
            dy
    };

    if (
        canPlace(
            moved
        )
    ) {

        currentPair =
            moved;

        return true;
    }

    return false;
}


function rotatePair() {

    if (
        !currentPair ||
        gameOver ||
        resolving ||
        paused ||
        starting
    ) {

        return;
    }

    const rotated = {

        ...currentPair,

        direction:
            (
                currentPair.direction +
                1
            ) %
            4
    };

    if (
        canPlace(
            rotated
        )
    ) {

        currentPair =
            rotated;

        return;
    }

    const leftKick = {

        ...rotated,

        x:
            rotated.x -
            1
    };

    if (
        canPlace(
            leftKick
        )
    ) {

        currentPair =
            leftKick;

        return;
    }

    const rightKick = {

        ...rotated,

        x:
            rotated.x +
            1
    };

    if (
        canPlace(
            rightKick
        )
    ) {

        currentPair =
            rightKick;
    }
}


// ========================================
// LOCK
// ========================================

function lockPair() {

    if (
        !currentPair ||
        gameOver ||
        resolving ||
        paused ||
        starting
    ) {

        return;
    }

    const sub =
        getSubPosition(
            currentPair
        );

    if (
        currentPair.y < 0 ||
        sub.y < 0
    ) {

        triggerGameOver();

        return;
    }

    board[
        currentPair.y
    ][
        currentPair.x
    ] =
        currentPair.main;

    board[
        sub.y
    ][
        sub.x
    ] =
        currentPair.sub;

    currentPair =
        null;

    applyGravity();

    draw();

    resolveBoard();
}


// ========================================
// GROUP SEARCH
// ========================================

function findClearGroups() {

    const visited =
        Array.from(
            {
                length:
                    ROWS
            },

            () =>
                Array(
                    COLS
                ).fill(
                    false
                )
        );

    const groups =
        [];

    for (
        let y = 0;
        y < ROWS;
        y++
    ) {

        for (
            let x = 0;
            x < COLS;
            x++
        ) {

            const type =
                board[y][x];

            if (
                type === EMPTY ||
                visited[y][x]
            ) {

                continue;
            }

            const group =
                [];

            const stack = [

                {
                    x,
                    y
                }
            ];

            visited[y][x] =
                true;

            while (
                stack.length >
                0
            ) {

                const cell =
                    stack.pop();

                group.push(
                    cell
                );

                const neighbors = [

                    {
                        x:
                            cell.x +
                            1,

                        y:
                            cell.y
                    },

                    {
                        x:
                            cell.x -
                            1,

                        y:
                            cell.y
                    },

                    {
                        x:
                            cell.x,

                        y:
                            cell.y +
                            1
                    },

                    {
                        x:
                            cell.x,

                        y:
                            cell.y -
                            1
                    }
                ];

                for (
                    const n
                    of neighbors
                ) {

                    if (
                        n.x >= 0 &&
                        n.x < COLS &&
                        n.y >= 0 &&
                        n.y < ROWS &&
                        !visited[n.y][n.x] &&
                        board[n.y][n.x] ===
                        type
                    ) {

                        visited[n.y][n.x] =
                            true;

                        stack.push(
                            n
                        );
                    }
                }
            }

            if (
                group.length >=
                4
            ) {

                groups.push(
                    group
                );
            }
        }
    }

    return groups;
}


// ========================================
// CLEAR RESOLVE
// ========================================

async function resolveBoard() {

    if (
        gameOver
    ) {

        return;
    }

    resolving =
        true;

    while (true) {

        const groups =
            findClearGroups();

        if (
            groups.length ===
            0
        ) {

            break;
        }

        const allCells =
            [];

        for (
            const group
            of groups
        ) {

            allCells.push(
                ...group
            );
        }

        const unique =
            new Map();

        for (
            const cell
            of allCells
        ) {

            unique.set(
                `${cell.x},${cell.y}`,
                cell
            );
        }

        const clearCells =
            [
                ...unique.values()
            ];

        triggerClearFlash();

        await animateClear(
            clearCells
        );

        for (
            const cell
            of clearCells
        ) {

            board[
                cell.y
            ][
                cell.x
            ] =
                EMPTY;
        }

        const cleared =
            clearCells.length;

        const clearMultiplier =
            getClearMultiplier(
                cleared
            );

        const feverMultiplier =
            feverActive
                ? 2
                : 1;

        const gainedScore =
            Math.round(
                cleared *
                100 *
                clearMultiplier *
                feverMultiplier
            );

        score +=
            gainedScore;

        playClearSe(
            cleared
        );

        bounceScore();

        showScorePopup(
            gainedScore,
            cleared >= 7
        );

        if (
            feverActive
        ) {

            showFeverSparkles(
                cleared >= 7
                    ? 16
                    : 10,

                cleared >= 7
            );

            jumpSanemiOnFever();

        } else {

            showFeverSparkles(
                cleared >= 6
                    ? 5
                    : 3,

                false
            );
        }

        showClearBonus(
            cleared
        );

        addFever(
            getFeverGain(
                cleared
            )
        );

        reactSanemiClear(
            cleared
        );

        updateUI();

        draw();

        await sleep(
            125
        );

        applyGravity();

        draw();

        await sleep(
            150
        );
    }

    updateDangerState();

    await maybeGiyuAttack();

    if (
        gameOver
    ) {

        resolving =
            false;

        return;
    }

    if (
        findClearGroups().length >
        0
    ) {

        resolving =
            false;

        await resolveBoard();

        return;
    }

    updateDangerState();

    resolving =
        false;

    spawnNextPair();
}


// ========================================
// GRAVITY
// ========================================

function applyGravity() {

    for (
        let x = 0;
        x < COLS;
        x++
    ) {

        let writeY =
            ROWS -
            1;

        for (
            let y =
                ROWS -
                1;
            y >= 0;
            y--
        ) {

            if (
                board[y][x] !==
                EMPTY
            ) {

                const value =
                    board[y][x];

                board[y][x] =
                    EMPTY;

                board[
                    writeY
                ][
                    x
                ] =
                    value;

                writeY--;
            }
        }

        while (
            writeY >=
            0
        ) {

            board[
                writeY
            ][
                x
            ] =
                EMPTY;

            writeY--;
        }
    }
}


// ========================================
// DIFFICULTY
// ========================================

function getElapsedSeconds() {

    return (
        performance.now() -
        gameStartTime
    ) /
        1000;
}


function getDifficultyName() {

    const seconds =
        getElapsedSeconds();

    if (
        seconds < 60
    ) {

        return "normal";
    }

    if (
        seconds < 100
    ) {

        return "high";
    }

    return "hell";
}


function updateDifficulty() {

    const seconds =
        getElapsedSeconds();

    let interval;

    if (
        seconds < 60
    ) {

        interval =
            600 -
            seconds *
            2;

    } else if (
        seconds < 100
    ) {

        interval =
            460 -
            (
                seconds -
                60
            ) *
            1.8;

    } else {

        interval =
            390 -
            (
                seconds -
                100
            ) *
            1.2;
    }

    interval =
        Math.max(
            MIN_DROP_INTERVAL,
            interval
        );

    if (
        dangerLevel ===
        DANGER_CAUTION
    ) {

        interval *=
            0.90;
    }

    if (
        dangerLevel ===
        DANGER_HIGH
    ) {

        interval *=
            0.78;
    }

    dropInterval =
        Math.max(
            230,
            interval
        );

    updateBgmPitch();

    playBgm();
}


// ========================================
// DANGER
// ========================================

function getTopOccupiedRow() {

    for (
        let y = 0;
        y < ROWS;
        y++
    ) {

        for (
            let x = 0;
            x < COLS;
            x++
        ) {

            if (
                board[y][x] !==
                EMPTY
            ) {

                return y;
            }
        }
    }

    return ROWS;
}


function calculateDangerLevel() {

    const topRow =
        getTopOccupiedRow();

    if (
        topRow <= 2
    ) {

        return DANGER_HIGH;
    }

    if (
        topRow <= 5
    ) {

        return DANGER_CAUTION;
    }

    return DANGER_NORMAL;
}


function updateDangerState() {

    const oldLevel =
        dangerLevel;

    const newLevel =
        calculateDangerLevel();

    dangerLevel =
        newLevel;

    if (
        feverActive ||
        gameOver
    ) {

        return;
    }

    if (
        newLevel ===
        DANGER_HIGH &&
        oldLevel !==
        DANGER_HIGH
    ) {

        clearReactionTimer();

        setSanemiImage(
            "danger"
        );

        sanemiMessage.textContent =
            "待て待て待てェ！！";

        setSanemiEffectMode(
            "danger"
        );

        showEvent(
            "⚠️ ちょっと多すぎる！"
        );

        return;
    }

    if (
        newLevel ===
        DANGER_CAUTION &&
        oldLevel ===
        DANGER_NORMAL
    ) {

        clearReactionTimer();

        setSanemiImage(
            "danger"
        );

        sanemiMessage.textContent =
            "おい、ちょっと待てェ";

        setSanemiEffectMode(
            "danger"
        );

        return;
    }

    if (
        oldLevel ===
        DANGER_HIGH &&
        newLevel <
        DANGER_HIGH
    ) {

        score +=
            3000;

        addFever(
            30
        );

        setSanemiImage(
            "happy"
        );

        sanemiMessage.textContent =
            "助かったァ…";

        setSanemiEffectMode(
            feverActive
                ? "bonus"
                : "happy"
        );

        bounceScore();

        showFeverSparkles(
            10,
            true
        );

        showEvent(
            "✨ 危機脱出！ +3000"
        );

        updateUI();

        scheduleCharacterRestore(
            1400
        );

        return;
    }

    if (
        newLevel ===
        DANGER_NORMAL &&
        oldLevel ===
        DANGER_CAUTION
    ) {

        restoreCharacters();
    }
}


function restoreSanemiByDanger() {

    if (
        gameOver
    ) {

        return;
    }

    if (
        feverActive
    ) {

        setSanemiImage(
            "happy"
        );

        sanemiFace.classList.add(
            "happy"
        );

        sanemiMessage.textContent =
            "うめェェ！！";

        setSanemiEffectMode(
            "bonus"
        );

        return;
    }

    sanemiFace.classList.remove(
        "happy",
        "fever-jump"
    );

    if (
        dangerLevel ===
        DANGER_HIGH
    ) {

        setSanemiImage(
            "danger"
        );

        sanemiMessage.textContent =
            "待て待て待てェ！！";

        setSanemiEffectMode(
            "danger"
        );

        return;
    }

    if (
        dangerLevel ===
        DANGER_CAUTION
    ) {

        setSanemiImage(
            "danger"
        );

        sanemiMessage.textContent =
            "おい、ちょっと待てェ";

        setSanemiEffectMode(
            "danger"
        );

        return;
    }

    setSanemiImage(
        "normal"
    );

    sanemiMessage.textContent =
        "おはぎィ？";

    setSanemiEffectMode(
        "normal"
    );
}


// ========================================
// CHARACTER RESTORE
// ========================================

function clearReactionTimer() {

    clearTimeout(
        reactionTimer
    );

    reactionTimer =
        null;
}


function scheduleCharacterRestore(ms) {

    clearReactionTimer();

    reactionTimer =
        setTimeout(
            restoreCharacters,
            ms
        );
}


function restoreCharacters() {

    if (
        gameOver
    ) {

        return;
    }

    restoreSanemiByDanger();

    if (
        feverActive
    ) {

        setGiyuImage(
            "happy"
        );

        giyuMessage.textContent =
            "よかった";

        showGiyuHeartBurst(
            2
        );

    } else {

        setGiyuImage(
            "normal"
        );

        giyuMessage.textContent =
            "…";
    }
}


// ========================================
// CLEAR REACTION
// ========================================

function reactSanemiClear(cleared) {

    if (
        feverActive
    ) {

        setSanemiImage(
            "happy"
        );

        setSanemiEffectMode(
            "bonus"
        );

        if (
            cleared >= 8
        ) {

            sanemiMessage.textContent =
                "うめェェ！！";

        } else if (
            cleared >= 6
        ) {

            sanemiMessage.textContent =
                "まだいけるぜェ！";

        } else {

            sanemiMessage.textContent =
                "うめェ！";
        }

        return;
    }

    clearReactionTimer();

    setSanemiImage(
        "happy"
    );

    sanemiFace.classList.add(
        "happy"
    );

    setSanemiEffectMode(
        "happy"
    );

    if (
        cleared >= 8
    ) {

        sanemiMessage.textContent =
            "うめェ！！";

    } else if (
        cleared >= 6
    ) {

        sanemiMessage.textContent =
            "いいじゃねェか";

    } else {

        sanemiMessage.textContent =
            `${cleared}個いただくぜェ`;
    }

    scheduleCharacterRestore(
        1300
    );
}


// ========================================
// GIYU SCHEDULE
// ========================================

function randomRange(
    min,
    max
) {

    return (
        min +
        Math.random() *
        (
            max -
            min
        )
    );
}


function getNextGiyuInterval() {

    const difficulty =
        getDifficultyName();

    if (
        dangerLevel ===
        DANGER_HIGH
    ) {

        return randomRange(
            5,
            7
        );
    }

    if (
        dangerLevel ===
        DANGER_CAUTION
    ) {

        return randomRange(
            7,
            10
        );
    }

    if (
        difficulty ===
        "hell"
    ) {

        return randomRange(
            6,
            9
        );
    }

    if (
        difficulty ===
        "high"
    ) {

        return randomRange(
            8,
            12
        );
    }

    return randomRange(
        12,
        17
    );
}


function scheduleNextGiyuAttack() {

    nextGiyuAttackAt =
        getElapsedSeconds() +
        getNextGiyuInterval();
}


function getGiyuAttackAmount() {

    const difficulty =
        getDifficultyName();

    let min =
        2;

    let max =
        3;

    if (
        difficulty ===
        "high"
    ) {

        min =
            3;

        max =
            4;
    }

    if (
        difficulty ===
        "hell"
    ) {

        min =
            4;

        max =
            6;
    }

    if (
        dangerLevel ===
        DANGER_CAUTION
    ) {

        max +=
            1;
    }

    if (
        dangerLevel ===
        DANGER_HIGH
    ) {

        min +=
            1;

        max +=
            2;
    }

    return (
        min +
        Math.floor(
            Math.random() *
            (
                max -
                min +
                1
            )
        )
    );
}


function getGiyuAttackMessage() {

    if (
        dangerLevel ===
        DANGER_HIGH
    ) {

        return "もっと食べろ";
    }

    const difficulty =
        getDifficultyName();

    if (
        difficulty ===
        "hell"
    ) {

        return "遠慮するな";
    }

    if (
        difficulty ===
        "high"
    ) {

        return "追加だ";
    }

    return "まだまだあるぞ";
}


function getGiyuDropRow(column) {

    for (
        let y =
            ROWS -
            1;
        y >= 0;
        y--
    ) {

        if (
            board[y][column] ===
            EMPTY
        ) {

            return y;
        }
    }

    return -1;
}


// ========================================
// GIYU ATTACK
// 義勇が水しぶきと一緒におはぎを追加
// ========================================

async function maybeGiyuAttack() {

    if (
        gameOver ||
        starting
    ) {

        return;
    }

    if (
        feverActive
    ) {

        scheduleNextGiyuAttack();

        return;
    }

    const elapsed =
        getElapsedSeconds();

    if (
        elapsed <
        nextGiyuAttackAt
    ) {

        return;
    }

    scheduleNextGiyuAttack();

    const amount =
        getGiyuAttackAmount();

    const message =
        getGiyuAttackMessage();

    clearReactionTimer();

    setGiyuImage(
        "attack"
    );

    giyuMessage.textContent =
        message;

    playGiyuSe();

    triggerWaterFlash();

    burstWaterAroundBoard(
        42
    );

    showGiyuAttackMessage(
        message
    );

    canvas.classList.add(
        "attacking"
    );

    if (
        giyuCard
    ) {

        giyuCard.classList.add(
            "attacking-card"
        );
    }

    if (
        giyuAttackOverlay
    ) {

        giyuAttackOverlay.classList.add(
            "show"
        );
    }

    spawnWaterBurst(
        window.innerWidth /
        2,

        window.innerHeight *
        0.42,

        40
    );

    setTimeout(
        () => {

            spawnWaterBurst(
                window.innerWidth /
                2 +
                48,

                window.innerHeight *
                0.42 -
                18,

                28
            );

        },
        90
    );

    setTimeout(
        () => {

            spawnWaterBurst(
                window.innerWidth /
                2 -
                44,

                window.innerHeight *
                0.42 +
                12,

                22
            );

        },
        180
    );

    await sleep(
        1300
    );

    if (
        gameOver ||
        feverActive
    ) {

        cleanupGiyuAttackVisuals();

        return;
    }

    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const candidates =
            [];

        for (
            let x = 0;
            x < COLS;
            x++
        ) {

            if (
                getGiyuDropRow(
                    x
                ) >=
                0
            ) {

                candidates.push(
                    x
                );
            }
        }

        if (
            candidates.length ===
            0
        ) {

            triggerGameOver();

            return;
        }

        const column =
            candidates[
            Math.floor(
                Math.random() *
                candidates.length
            )
            ];

        const targetRow =
            getGiyuDropRow(
                column
            );

        const type =
            randomOhagi();

        await animateGiyuDrop(
            column,
            targetRow,
            type
        );

        if (
            gameOver
        ) {

            return;
        }

        board[
            targetRow
        ][
            column
        ] =
            type;

        const rect =
            canvas.getBoundingClientRect();

        const scale =
            rect.width /
            canvas.width;

        const burstX =
            rect.left +
            (
                column *
                CELL +
                CELL /
                2
            ) *
            scale;

        const burstY =
            rect.top +
            (
                targetRow *
                CELL +
                CELL /
                2
            ) *
            scale;

        createWaterBurst(
            burstX,
            burstY,
            14,
            0.75
        );

        draw();

        await sleep(
            70
        );
    }

    dangerLevel =
        calculateDangerLevel();

    setSanemiImage(
        "angry"
    );

    setSanemiEffectMode(
        "angry"
    );

    sanemiMessage.textContent =
        dangerLevel ===
            DANGER_HIGH

            ? "もういらねェ！！"

            : "増やすんじゃねェ！！";

    await sleep(
        1850
    );

    if (
        gameOver
    ) {

        return;
    }

    cleanupGiyuAttackVisuals();

    setGiyuImage(
        "normal"
    );

    giyuMessage.textContent =
        "…";

    restoreSanemiByDanger();
}


function cleanupGiyuAttackVisuals() {

    canvas.classList.remove(
        "attacking"
    );

    if (
        giyuCard
    ) {

        giyuCard.classList.remove(
            "attacking-card"
        );
    }

    if (
        giyuAttackOverlay
    ) {

        giyuAttackOverlay.classList.remove(
            "show"
        );
    }

    if (
        giyuAttackMessage
    ) {

        giyuAttackMessage.classList.remove(
            "show"
        );
    }
}


// ========================================
// NEXT
// ========================================

function spawnNextPair() {

    if (gameOver) {
        return;
    }

    if (getTopOccupiedRow() <= 1) {
        triggerGameOver();
        return;
    }

    currentPair = nextPair;

    currentPair.x = 2;
    currentPair.y = 0;
    currentPair.direction = 2;

    nextPair = createPair();

    drawNext();

    if (!canPlace(currentPair)) {
        triggerGameOver();
    }
}


// ========================================
// EVENT
// ========================================

function showEvent(text) {

    eventMessage.textContent =
        text;

    eventMessage.classList.remove(
        "show"
    );

    void eventMessage.offsetWidth;

    eventMessage.classList.add(
        "show"
    );

    setTimeout(
        () => {

            eventMessage.classList.remove(
                "show"
            );

        },
        1250
    );
}


// ========================================
// GAME OVER
// ========================================

function triggerGameOver() {

    if (
        gameOver
    ) {

        return;
    }

    gameOver =
        true;

    starting =
        false;

    currentPair =
        null;

    clearReactionTimer();

    clearTimeout(
        feverTimer
    );

    feverActive =
        false;

    clearSanemiEffects();

    document.body.classList.remove(
        "fever-active"
    );

    cleanupGiyuAttackVisuals();

    if (
        feverStartMessage
    ) {

        feverStartMessage.classList.remove(
            "show"
        );
    }

    if (
        startMessage
    ) {

        startMessage.classList.remove(
            "show"
        );
    }

    sanemiFace.classList.remove(
        "happy",
        "angry",
        "fever-jump"
    );

    setSanemiImage(
        "gameover"
    );

    sanemiMessage.textContent =
        "腹いっぱいだァ…";

    setGiyuImage(
        "happy"
    );

    giyuMessage.textContent =
        "よかった";

    startGiyuGameOverHearts();

    startSanemiGameOverPoya();

    if (
        sanemiGameOverOverlay
    ) {

        sanemiGameOverOverlay.classList.add(
            "show"
        );
    }

    gameOverPanel.classList.remove(
        "hidden"
    );

    pauseBgm();

    playGameOverSe();
}


// ========================================
// CLEAR FLASH
// ========================================

function triggerClearFlash() {

    canvas.classList.remove(
        "clear-flash"
    );

    void canvas.offsetWidth;

    canvas.classList.add(
        "clear-flash"
    );
}


// ========================================
// GIYU DROP
// ========================================

async function animateGiyuDrop(
    column,
    targetRow,
    type
) {

    const duration =
        dangerLevel ===
            DANGER_HIGH

            ? 420
            : 520;

    const start =
        performance.now();

    const startY =
        -80;

    const targetY =
        targetRow *
        CELL;

    return new Promise(
        resolve => {

            function frame(now) {

                const progress =
                    Math.min(
                        (
                            now -
                            start
                        ) /
                        duration,

                        1
                    );

                draw();

                const eased =
                    1 -
                    Math.pow(
                        1 -
                        progress,
                        3
                    );

                const y =
                    startY +
                    (
                        targetY -
                        startY
                    ) *
                    eased;

                const centerX =
                    column *
                    CELL +
                    CELL /
                    2;

                for (
                    let i = 0;
                    i < 7;
                    i++
                ) {

                    const trailY =
                        y -
                        12 -
                        i *
                        14;

                    ctx.save();

                    ctx.globalAlpha =
                        Math.max(
                            0,
                            0.24 -
                            i *
                            0.029
                        );

                    ctx.fillStyle =
                        "#7dd3f2";

                    ctx.beginPath();

                    ctx.ellipse(
                        centerX,
                        trailY,

                        8 -
                        i *
                        0.65,

                        14 -
                        i *
                        1.2,

                        0,
                        0,
                        Math.PI *
                        2
                    );

                    ctx.fill();

                    ctx.restore();
                }

                drawOhagi(
                    ctx,
                    column *
                    CELL,
                    y,
                    type
                );

                if (
                    progress <
                    1
                ) {

                    requestAnimationFrame(
                        frame
                    );

                } else {

                    resolve();
                }
            }

            requestAnimationFrame(
                frame
            );
        }
    );
}


// ========================================
// CLEAR ANIMATION
// ========================================

async function animateClear(cells) {

    const duration =
        390;

    const start =
        performance.now();

    return new Promise(
        resolve => {

            function frame(now) {

                const progress =
                    Math.min(
                        (
                            now -
                            start
                        ) /
                        duration,

                        1
                    );

                draw();

                for (
                    const cell
                    of cells
                ) {

                    const type =
                        board[
                        cell.y
                        ][
                        cell.x
                        ];

                    if (
                        type ===
                        EMPTY
                    ) {

                        continue;
                    }

                    const scale =
                        1 +
                        Math.sin(
                            progress *
                            Math.PI
                        ) *
                        0.35;

                    const alpha =
                        1 -
                        progress;

                    ctx.save();

                    ctx.globalAlpha =
                        alpha;

                    ctx.translate(
                        cell.x *
                        CELL +
                        CELL /
                        2,

                        cell.y *
                        CELL +
                        CELL /
                        2
                    );

                    ctx.scale(
                        scale,
                        scale
                    );

                    drawOhagi(
                        ctx,
                        -CELL / 2,
                        -CELL / 2,
                        type
                    );

                    ctx.restore();
                }

                if (
                    progress <
                    1
                ) {

                    requestAnimationFrame(
                        frame
                    );

                } else {

                    resolve();
                }
            }

            requestAnimationFrame(
                frame
            );
        }
    );
}

// DRAW OHAGI
// ========================================

function drawOhagi(
    context,
    x,
    y,
    type,
    size = CELL
) {

    const data =
        OHAGI_TYPES.find(
            item =>
                item.id ===
                type
        );

    if (!data) {
        return;
    }

    const cx =
        x +
        size /
        2;

    const cy =
        y +
        size /
        2;

    const rx =
        size *
        0.37;

    const ry =
        size *
        0.31;

    context.save();

    context.fillStyle =
        "rgba(0, 0, 0, 0.14)";

    context.beginPath();

    context.ellipse(
        cx +
        2,

        cy +
        size *
        0.16,

        size *
        0.34,

        size *
        0.18,

        0,
        0,
        Math.PI *
        2
    );

    context.fill();

    context.fillStyle =
        data.color;

    context.beginPath();

    context.ellipse(
        cx,
        cy,
        rx,
        ry,
        0,
        0,
        Math.PI *
        2
    );

    context.fill();

    context.strokeStyle =
        "rgba(60, 35, 20, 0.18)";

    context.lineWidth =
        1.4;

    context.stroke();

    context.fillStyle =
        "rgba(255,255,255,0.18)";

    context.beginPath();

    context.ellipse(
        cx -
        rx *
        0.28,

        cy -
        ry *
        0.24,

        rx *
        0.24,

        ry *
        0.14,

        -0.3,
        0,
        Math.PI *
        2
    );

    context.fill();

    if (
        type ===
        1
    ) {

        context.fillStyle =
            data.inner;

        context.beginPath();

        context.ellipse(
            cx +
            rx *
            0.08,

            cy +
            ry *
            0.02,

            rx *
            0.18,

            ry *
            0.12,

            0.1,
            0,
            Math.PI *
            2
        );

        context.fill();
    }

    if (
        type ===
        2
    ) {

        const dots = [

            [-0.55, -0.25],
            [-0.30, -0.40],
            [0.02, -0.35],
            [0.35, -0.26],
            [0.55, -0.05],
            [-0.48, 0.05],
            [-0.20, -0.05],
            [0.15, 0.02],
            [0.42, 0.18],
            [-0.35, 0.30],
            [-0.05, 0.32],
            [0.25, 0.30]
        ];

        dots.forEach(
            (
                dot,
                i
            ) => {

                context.fillStyle =
                    i % 2 ===
                        0

                        ? "#f4df9e"
                        : "#c99530";

                context.beginPath();

                context.arc(
                    cx +
                    rx *
                    dot[0],

                    cy +
                    ry *
                    dot[1],

                    size *
                    0.025,

                    0,
                    Math.PI *
                    2
                );

                context.fill();
            }
        );
    }

    if (
        type ===
        3
    ) {

        const lumps = [

            [-0.18, -0.06],
            [0.00, -0.12],
            [0.18, -0.02],
            [-0.08, 0.10],
            [0.10, 0.10]
        ];

        for (
            const lump
            of lumps
        ) {

            context.fillStyle =
                lump[0] >
                    0

                    ? "#b8d97a"
                    : "#6e9239";

            context.beginPath();

            context.ellipse(
                cx +
                rx *
                lump[0],

                cy +
                ry *
                lump[1],

                rx *
                0.13,

                ry *
                0.11,

                0,
                0,
                Math.PI *
                2
            );

            context.fill();
        }
    }

    if (
        type ===
        4
    ) {

        const sesame = [

            [-0.55, -0.24],
            [-0.30, -0.39],
            [-0.04, -0.30],
            [0.24, -0.40],
            [0.49, -0.20],
            [-0.50, 0.03],
            [-0.25, -0.02],
            [0.05, -0.07],
            [0.33, 0.01],
            [0.52, 0.18],
            [-0.39, 0.27],
            [-0.10, 0.25],
            [0.18, 0.31],
            [0.39, 0.29]
        ];

        sesame.forEach(
            (
                dot,
                i
            ) => {

                context.fillStyle =
                    i % 3 ===
                        0

                        ? "#dddddd"
                        : "#999999";

                context.beginPath();

                context.ellipse(
                    cx +
                    rx *
                    dot[0],

                    cy +
                    ry *
                    dot[1],

                    size *
                    0.017,

                    size *
                    0.029,

                    0.5,
                    0,
                    Math.PI *
                    2
                );

                context.fill();
            }
        );
    }

    context.restore();
}


// ========================================
// DRAW BOARD
// ========================================

function drawBoardGrid() {

    ctx.strokeStyle =
        "rgba(67, 53, 35, 0.055)";

    ctx.lineWidth =
        1;

    for (
        let x = 0;
        x <= COLS;
        x++
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x *
            CELL,
            0
        );

        ctx.lineTo(
            x *
            CELL,

            ROWS *
            CELL
        );

        ctx.stroke();
    }

    for (
        let y = 0;
        y <= ROWS;
        y++
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y *
            CELL
        );

        ctx.lineTo(
            COLS *
            CELL,

            y *
            CELL
        );

        ctx.stroke();
    }
}


function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle =
        feverActive

            ? "#fff5bd"
            : "#fffaf0";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawBoardGrid();

    for (
        let y = 0;
        y < ROWS;
        y++
    ) {

        for (
            let x = 0;
            x < COLS;
            x++
        ) {

            const type =
                board[y][x];

            if (
                type !==
                EMPTY
            ) {

                drawOhagi(
                    ctx,

                    x *
                    CELL,

                    y *
                    CELL,

                    type
                );
            }
        }
    }

    if (
        !gameOver &&
        currentPair
    ) {

        drawOhagi(
            ctx,

            currentPair.x *
            CELL,

            currentPair.y *
            CELL,

            currentPair.main
        );

        const sub =
            getSubPosition(
                currentPair
            );

        if (
            sub.y >=
            0
        ) {

            drawOhagi(
                ctx,

                sub.x *
                CELL,

                sub.y *
                CELL,

                currentPair.sub
            );
        }
    }
}


// ========================================
// DRAW NEXT
// ========================================

function drawNext() {

    nextCtx.clearRect(
        0,
        0,
        nextCanvas.width,
        nextCanvas.height
    );

    drawOhagi(
        nextCtx,
        35,
        24,
        nextPair.main,
        50
    );

    drawOhagi(
        nextCtx,
        35,
        66,
        nextPair.sub,
        50
    );
}


// ========================================
// UI
// ========================================

function updateUI() {

    scoreEl.textContent =
        score.toLocaleString();

    updateFeverUI();

    updateDifficulty();
}


// ========================================
// PAUSE
// ========================================

function togglePause() {

    if (
        gameOver ||
        starting
    ) {

        return;
    }

    paused =
        !paused;

    if (
        paused
    ) {

        pausePanel.classList.remove(
            "hidden"
        );

        pauseBtn.textContent =
            "RESUME";

        pauseBgm();

    } else {

        pausePanel.classList.add(
            "hidden"
        );

        pauseBtn.textContent =
            "PAUSE";

        lastDropTime =
            performance.now();

        playBgm();
    }
}


// ========================================
// GAME LOOP
// ========================================

function update(
    time = 0
) {

    if (
        !gameOver &&
        !paused &&
        !starting &&
        !waitingForUserStart
    ) {

        updateDifficulty();
    }

    if (
        !gameOver &&
        !paused &&
        !starting &&
        !waitingForUserStart &&
        !resolving &&
        currentPair
    ) {

        const delta =
            time -
            lastDropTime;

        if (
            delta >
            dropInterval
        ) {

            const moved =
                movePair(
                    0,
                    1
                );

            if (
                !moved
            ) {

                lockPair();

            } else if (
                currentPair
            ) {

                const testPair = {

                    ...currentPair,

                    y:
                        currentPair.y +
                        1
                };

                if (
                    !canPlace(
                        testPair
                    )
                ) {

                    lockPair();
                }
            }

            lastDropTime =
                time;
        }
    }

    draw();

    requestAnimationFrame(
        update
    );
}


function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}

// ========================================
// RESTART
// ========================================

function restartGame() {

    board =
        createBoard();

    score =
        0;

    gameOver =
        false;

    resolving =
        false;

    paused =
        false;

    starting =
        true;

    dangerLevel =
        DANGER_NORMAL;

    fever =
        0;

    feverActive =
        false;

    clearTimeout(
        feverTimer
    );

    clearReactionTimer();

    stopGiyuGameOverHearts();

    stopSanemiGameOverPoya();

    clearSanemiEffects();

    clearGiyuEffects();

    document.body.classList.remove(
        "fever-active"
    );

    sanemiFace.classList.remove(
        "happy",
        "angry",
        "fever-jump"
    );

    setSanemiImage(
        "normal"
    );

    sanemiMessage.textContent =
        "おはぎィ？";

    setSanemiEffectMode(
        "normal"
    );

    setGiyuImage(
        "normal"
    );

    giyuMessage.textContent =
        "…";

    cleanupGiyuAttackVisuals();

    gameOverPanel.classList.add(
        "hidden"
    );

    pausePanel.classList.add(
        "hidden"
    );

    pauseBtn.textContent =
        "PAUSE";

    if (
        sanemiGameOverOverlay
    ) {

        sanemiGameOverOverlay.classList.remove(
            "show"
        );
    }

    if (
        feverStartMessage
    ) {

        feverStartMessage.classList.remove(
            "show"
        );
    }

    if (
        startMessage
    ) {

        startMessage.classList.remove(
            "show"
        );
    }

    canvas.classList.remove(
        "clear-flash"
    );

    document
        .querySelectorAll(
            ".score-popup, .fever-sparkle, .water-particle, .water-ring"
        )
        .forEach(
            element =>
                element.remove()
        );

    currentPair =
        createPair();

    currentPair.direction =
        2;

    nextPair =
        createPair();

    dropInterval =
        START_DROP_INTERVAL;

    lastDropTime =
        0;

    gameStartTime =
        performance.now();

    updateUI();

    drawNext();

    draw();

    if (
        !waitingForUserStart
    ) {

        showStartMessage();
    }

    if (
        audioUnlocked
    ) {

        playBgm();
    }

    setTimeout(
        () => {

            if (
                gameOver ||
                waitingForUserStart
            ) {

                return;
            }

            starting =
                false;

            gameStartTime =
                performance.now();

            lastDropTime =
                performance.now();

            scheduleNextGiyuAttack();

        },
        1300
    );
}


// ========================================
// SOFT DROP
// ========================================

function softDrop() {

    if (
        starting
    ) {

        return;
    }

    const moved =
        movePair(
            0,
            1
        );

    if (
        !moved
    ) {

        lockPair();

        return;
    }

    if (
        currentPair
    ) {

        const testPair = {

            ...currentPair,

            y:
                currentPair.y +
                1
        };

        if (
            !canPlace(
                testPair
            )
        ) {

            lockPair();
        }
    }
}


// ========================================
// KEYBOARD
// ========================================

document.addEventListener(
    "keydown",

    event => {

        if (
            waitingForUserStart
        ) {

            return;
        }

        unlockAudio();

        if (
            event.code ===
            "Escape"
        ) {

            event.preventDefault();

            togglePause();

            return;
        }

        if (
            [
                "ArrowLeft",
                "ArrowRight",
                "ArrowDown",
                "ArrowUp",
                "Space"
            ].includes(
                event.code
            )
        ) {

            event.preventDefault();
        }

        if (
            event.code ===
            "ArrowLeft"
        ) {

            movePair(
                -1,
                0
            );
        }

        if (
            event.code ===
            "ArrowRight"
        ) {

            movePair(
                1,
                0
            );
        }

        if (
            event.code ===
            "ArrowDown"
        ) {

            softDrop();
        }

        if (
            event.code ===
            "ArrowUp" ||
            event.code ===
            "Space"
        ) {

            rotatePair();
        }
    }
);


// ========================================
// MOBILE CONTROL
// ========================================

let mobileRepeatTimer =
    null;

let mobileRepeatStartTimer =
    null;


function stopMobileRepeat() {

    clearTimeout(
        mobileRepeatStartTimer
    );

    clearInterval(
        mobileRepeatTimer
    );

    mobileRepeatStartTimer =
        null;

    mobileRepeatTimer =
        null;
}


function performMobileAction(action) {

    if (
        starting ||
        waitingForUserStart
    ) {

        return;
    }

    if (
        action ===
        "left"
    ) {

        movePair(
            -1,
            0
        );
    }

    if (
        action ===
        "right"
    ) {

        movePair(
            1,
            0
        );
    }

    if (
        action ===
        "down"
    ) {

        softDrop();
    }

    if (
        action ===
        "rotate"
    ) {

        rotatePair();
    }
}


document
    .querySelectorAll(
        ".mobile-controls button"
    )
    .forEach(
        button => {

            const action =
                button.dataset.action;

            button.addEventListener(
                "pointerdown",

                event => {

                    event.preventDefault();

                    unlockAudio();

                    stopMobileRepeat();

                    performMobileAction(
                        action
                    );

                    if (
                        action ===
                        "rotate"
                    ) {

                        return;
                    }

                    mobileRepeatStartTimer =
                        setTimeout(
                            () => {

                                mobileRepeatTimer =
                                    setInterval(
                                        () => {

                                            performMobileAction(
                                                action
                                            );

                                        },

                                        action ===
                                            "down"

                                            ? 65
                                            : 95
                                    );

                            },
                            190
                        );
                }
            );

            button.addEventListener(
                "pointerup",
                stopMobileRepeat
            );

            button.addEventListener(
                "pointercancel",
                stopMobileRepeat
            );

            button.addEventListener(
                "pointerleave",
                stopMobileRepeat
            );
        }
    );


document.addEventListener(
    "pointerup",
    stopMobileRepeat
);


// ========================================
// FIRST START / iOS AUDIO GATE
// ========================================

function beginFirstGame() {
    if (!waitingForUserStart) {
        return;
    }

    audioUnlocked = true;

    if (bgmMain) {
        bgmMain.volume = 0.22;
        bgmMain.loop = true;
        bgmMain.currentTime = 0;

        const playPromise = bgmMain.play();

        if (playPromise) {
            playPromise.catch(error => {
                console.error("BGM start failed:", error);
            });
        }
    }

    waitingForUserStart = false;
    starting = false;

    gameStartTime = performance.now();
    lastDropTime = performance.now();

    scheduleNextGiyuAttack();

    if (startGate) {
        startGate.classList.add("hidden");
    }

    showStartMessage();

    if (!audioWarmed) {
        audioWarmed = true;

        warmAudioElement(clearSe);
        warmAudioElement(giyuSe);
        warmAudioElement(gameOverSe);
    }
}


if (
    startGameBtn
) {

    startGameBtn.addEventListener(
        "click",

        event => {

            event.preventDefault();

            beginFirstGame();
        }
    );
}


// ========================================
// MOBILE VIEWPORT / SAFARI
// ========================================

function syncAppHeight() {

    const viewportHeight =
        window.visualViewport
            ? window.visualViewport.height
            : window.innerHeight;

    document.documentElement.style.setProperty(
        "--app-height",
        `${Math.round(viewportHeight)}px`
    );
}


syncAppHeight();


window.addEventListener(
    "resize",
    syncAppHeight,
    {
        passive: true
    }
);


window.addEventListener(
    "orientationchange",
    () => {

        setTimeout(
            syncAppHeight,
            120
        );

        setTimeout(
            syncAppHeight,
            420
        );
    },
    {
        passive: true
    }
);


if (
    window.visualViewport
) {

    window.visualViewport.addEventListener(
        "resize",
        syncAppHeight,
        {
            passive: true
        }
    );
}


document.addEventListener(
    "touchmove",

    event => {

        if (
            event.target.closest(
                ".mobile-controls, #gameCanvas"
            )
        ) {

            event.preventDefault();
        }
    },

    {
        passive: false
    }
);

document.addEventListener("gesturestart", event => {
    event.preventDefault();
}, { passive: false });

document.addEventListener("gesturechange", event => {
    event.preventDefault();
}, { passive: false });

document.addEventListener("gestureend", event => {
    event.preventDefault();
}, { passive: false });

let lastTouchEnd = 0;

document.addEventListener("touchend", event => {
    const now = Date.now();

    if (now - lastTouchEnd <= 400) {
        event.preventDefault();
    }

    lastTouchEnd = now;
}, { passive: false });

document.addEventListener("dblclick", event => {
    event.preventDefault();
}, { passive: false });


let lastTouchEnd = 0;

document.addEventListener(
    "touchend",
    event => {

        const now = Date.now();

        if (
            now - lastTouchEnd <= 350
        ) {
            event.preventDefault();
        }

        lastTouchEnd = now;
    },
    {
        passive: false
    }
);


// ========================================
// BUTTON
// ========================================

pauseBtn.addEventListener(
    "click",

    () => {

        unlockAudio();

        togglePause();
    }
);


restartBtn.addEventListener(
    "click",

    () => {

        unlockAudio();

        stopBgm();

        restartGame();

        playBgm();
    }
);


// ========================================
// START
// ========================================

restartGame();

waitingForUserStart =
    true;

starting =
    true;

if (
    startGate
) {

    startGate.classList.remove(
        "hidden"
    );
}

requestAnimationFrame(
    update
);