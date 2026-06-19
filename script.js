let cards = [];
let currentIndex = 0;
let isPlaying = true;
let timerId = null;
let delayTimerId = null;

// DOM 요소 탐색
const partSelect = document.getElementById('partSelect');
const cardIntervalInput = document.getElementById('cardInterval');
const englishDelayInput = document.getElementById('englishDelay');
const textEn = document.getElementById('textEn');
const textKo = document.getElementById('textKo');
const prevBtn = document.getElementById('prevBtn');
const toggleBtn = document.getElementById('toggleBtn');
const nextBtn = document.getElementById('nextBtn');

// 14개 파일 중 선택된 파트의 JSON 데이터를 로드하는 함수
function loadPartData() {
    const selectedPart = partSelect.value; // 예: "01", "02" 등
    const filename = `english_card_part${selectedPart}.json`;

    // 타이머 초기화
    clearTimers();

    fetch(filename)
        .then(response => {
            if (!response.ok) throw new Error('파일을 찾을 수 없습니다.');
            return response.json();
        })
        .then(data => {
            cards = data;
            currentIndex = 0;
            showCard();
            if (isPlaying) {
                startAutoPlay();
            }
        })
        .catch(error => {
            console.error('데이터 로드 실패:', error);
            textKo.textContent = "데이터 로드 실패";
            textEn.textContent = "";
        });
}

// 카드 화면 표시 함수
function showCard() {
    if (cards.length === 0) return;

    const currentCard = cards[currentIndex];
    
    // 1. 한글은 즉시 노출
    textKo.textContent = currentCard.ko;
    
    // 2. 영어는 우선 숨김 처리
    textEn.textContent = currentCard.en;
    textEn.classList.remove('show');

    // 기존의 지연 타이머가 돌고 있다면 취소
    if (delayTimerId) clearTimeout(delayTimerId);

    // 3. 설정된 지연 시간(초) 후에 영어 페이드인 효과 적용
    const delaySeconds = parseFloat(englishDelayInput.value) || 0;
    delayTimerId = setTimeout(() => {
        textEn.classList.add('show');
    }, delaySeconds * 1000);
}

// 자동 재생 타이머 시작
function startAutoPlay() {
    if (timerId) clearInterval(timerId);
    
    const intervalSeconds = parseFloat(cardIntervalInput.value) || 5;
    timerId = setInterval(() => {
        nextCard();
    }, intervalSeconds * 1000);
}

// 타이머 정지 및 해제
function clearTimers() {
    if (timerId) clearInterval(timerId);
    if (delayTimerId) clearTimeout(delayTimerId);
}

// 다음 카드로 이동
function nextCard() {
    if (cards.length === 0) return;
    currentIndex = (currentIndex + 1) % cards.length;
    showCard();
}

// 이전 카드로 이동
function prevCard() {
    if (cards.length === 0) return;
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    showCard();
}

// 재생/정지 토글
function togglePlay() {
    if (isPlaying) {
        isPlaying = false;
        clearTimers();
        toggleBtn.textContent = "재생";
        toggleBtn.classList.add('paused');
    } else {
        isPlaying = true;
        startAutoPlay();
        // 정지했다가 다시 재생할 때는 현재 카드 애니메이션 다시 유도하기 위해 showCard 호출
        showCard(); 
        toggleBtn.textContent = "정지";
        toggleBtn.classList.remove('paused');
    }
}

// 이벤트 리스너 등록
partSelect.addEventListener('change', loadPartData); // 파트 변경 시 새 파일 로드
cardIntervalInput.addEventListener('change', () => { if (isPlaying) startAutoPlay(); });
prevBtn.addEventListener('click', () => { prevCard(); if (isPlaying) startAutoPlay(); });
nextBtn.addEventListener('click', () => { nextCard(); if (isPlaying) startAutoPlay(); });
toggleBtn.addEventListener('click', togglePlay);

// 프로그램 첫 시작 시 실행
loadPartData();