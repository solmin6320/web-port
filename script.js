// --- 1. 실시간 시계 기능 ---
function updateCurrentTime() {
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    
    let hours = now.getHours();
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = String(hours).padStart(2, '0');
    
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timeString = `${year}년 ${month}월 ${date}일 ${ampm} ${formattedHours}:${minutes}:${seconds}`;
    
    document.getElementById('currentTimeDisplay').innerText = timeString;
}

setInterval(updateCurrentTime, 1000);
updateCurrentTime();

// --- 2. 성일정보고 학교 정보 (나이스 기준) ---
const educationOfficeCode = "J10"; // 경기도교육청
const schoolCode = "7530167";      // 성일정보고등학교

// --- 3. 특정 날짜(YYYYMMDD) 형식 만들기 ---
function getFormattedDate(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const date = String(dateObj.getDate()).padStart(2, '0');
    return `${year}${month}${date}`;
}

// 화면 표시용 날짜 형식 (MM월 DD일)
function getDisplayDate(dateObj) {
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const date = String(dateObj.getDate()).padStart(2, '0');
    return `${month}월 ${date}일`;
}

// --- 4. 메뉴 화면에 그리기 (알러지 정보 제거 등 깔끔하게 처리) ---
function renderMealData(mealString, titleElementId, listElementId, label, dateObj) {
    const titleElem = document.getElementById(titleElementId);
    const listElem = document.getElementById(listElementId);
    
    titleElem.innerText = `${getDisplayDate(dateObj)} ${label} 😋`;
    listElem.innerHTML = '';

    if (mealString) {
        // 급식 데이터에서 불필요한 알러지 번호(예: 1.2.3.)와 특수문자를 제거하고 메뉴별로 쪼갬
        const cleanMenus = mealString
            .replace(/[0-9]+\./g, '') // 숫자. 제거
            .replace(/\([^)]*\)/g, '') // 괄호와 그 안의 내용 제거
            .split('<br/>') // 줄바꿈을 기준으로 분리
            .map(menu => menu.trim()) // 앞뒤 공백 제거
            .filter(menu => menu.length > 0); // 빈칸 제거

        cleanMenus.forEach(item => {
            const li = document.createElement('li');
            li.innerText = `🍽️ ${item}`;
            listElem.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.innerText = "이날은 급식 정보가 없거나 휴일입니다 😢";
        li.style.color = "#94a3b8"; 
        listElem.appendChild(li);
    }
}

// --- 5. 서버에서 급식 데이터 긁어오기 (자동화의 핵심) ---
async function fetchAndRenderLunch() {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const todayStr = getFormattedDate(today);
    const tomorrowStr = getFormattedDate(tomorrow);

    // 나이스 오픈 API 기반 무료 급식 API 호출 (인증키 불필요)
    // 2026년 5월 8일과 9일의 데이터를 한 번에 가져오기 위해 시작일과 종료일을 설정합니다.
    const apiUrl = `https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&pIndex=1&pSize=10&ATPT_OFCDC_SC_CODE=${educationOfficeCode}&SD_SCHUL_CODE=${schoolCode}&MLSV_FROM_YMD=${todayStr}&MLSV_TO_YMD=${tomorrowStr}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        let todayMeal = "";
        let tomorrowMeal = "";

        // 데이터가 정상적으로 들어왔는지 확인
        if (data.mealServiceDietInfo && data.mealServiceDietInfo[1].row) {
            const mealList = data.mealServiceDietInfo[1].row;
            
            // 가져온 식단 목록 중 오늘 날짜와 내일 날짜에 맞는 중식(급식코드 2)을 찾음
            mealList.forEach(meal => {
                if (meal.MMEAL_SC_CODE === "2") { // 중식
                    if (meal.MLSV_YMD === todayStr) todayMeal = meal.DDISH_NM;
                    if (meal.MLSV_YMD === tomorrowStr) tomorrowMeal = meal.DDISH_NM;
                }
            });
        }

        // 화면에 그리기 호출
        renderMealData(todayMeal, 'todayDateTitle', 'todayMenuList', '오늘의 급식', today);
        renderMealData(tomorrowMeal, 'tomorrowDateTitle', 'tomorrowMenuList', '내일의 급식', tomorrow);

    } catch (error) {
        console.error("급식 데이터를 가져오는 중 에러 발생:", error);
        document.getElementById('todayMenuList').innerHTML = "<li style='color:#ef4444;'>데이터를 불러올 수 없습니다. 인터넷 연결을 확인하세요.</li>";
        document.getElementById('tomorrowMenuList').innerHTML = "<li></li>";
    }
}

// --- 6. 모달 열기 / 닫기 ---
function openModal() {
    fetchAndRenderLunch(); // 클릭할 때마다 실시간으로 최신 데이터를 땡겨옵니다.
    document.getElementById('lunchModal').classList.add('show');
    document.getElementById('modalOverlay').classList.add('show');
}

function closeModal() {
    document.getElementById('lunchModal').classList.remove('show');
    document.getElementById('modalOverlay').classList.remove('show');
}

setTimeout(() => {
    document.body.style.overflow = 'auto';
}, 1500);
