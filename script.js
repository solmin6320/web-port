// --- 1. 실시간 시계 기능 ---
function updateCurrentTime() {
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    
    // 오전/오후 및 12시간제 변환
    let hours = now.getHours();
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0시를 12시로 표시
    const formattedHours = String(hours).padStart(2, '0');
    
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timeString = `${year}년 ${month}월 ${date}일 ${ampm} ${formattedHours}:${minutes}:${seconds}`;
    
    document.getElementById('currentTimeDisplay').innerText = timeString;
}

// 1초마다 시계 업데이트 실행
setInterval(updateCurrentTime, 1000);
updateCurrentTime(); // 로딩되자마자 즉시 한번 실행


// --- 2. 한 달 치 급식 데이터 저장소 ---
const monthlyLunchData = {
    // 예시: "2026-05-06": ["메뉴1", "메뉴2"],
};

const modal = document.getElementById('lunchModal');
const overlay = document.getElementById('modalOverlay');
const lunchDateTitle = document.getElementById('lunchDateTitle');
const lunchMenuList = document.getElementById('lunchMenuList');

// --- 3. 오늘 날짜 확인 및 급식 세팅 ---
function getTodayLunch() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); 
    const date = String(today.getDate()).padStart(2, '0');
    
    const todayString = `${year}-${month}-${date}`; 
    lunchDateTitle.innerText = `${month}월 ${date}일 오늘의 급식 😋`;
    lunchMenuList.innerHTML = '';

    const todayMenu = monthlyLunchData[todayString];

    if (todayMenu && todayMenu.length > 0) {
        todayMenu.forEach(item => {
            const li = document.createElement('li');
            li.innerText = item;
            lunchMenuList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.innerText = "아직 식단이 등록되지 않았습니다 😢\n(나중에 식단표를 추가하면 업데이트 됩니다!)";
        li.style.color = "#94a3b8"; 
        li.style.whiteSpace = "pre-line"; 
        lunchMenuList.appendChild(li);
    }
}

// --- 4. 모달 열기 / 닫기 ---
function openModal() {
    getTodayLunch(); 
    modal.classList.add('show');
    overlay.classList.add('show');
}

function closeModal() {
    modal.classList.remove('show');
    overlay.classList.remove('show');
}

// --- 5. 애니메이션 종료 후 스크롤 활성화 (시간 단축) ---
// CSS에서 애니메이션이 0.8초+0.1초 딜레이로 끝나므로 1초(1000ms) 뒤에 풀어줍니다.
setTimeout(() => {
    document.body.style.overflow = 'auto';
}, 1000);
