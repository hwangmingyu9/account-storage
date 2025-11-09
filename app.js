// ==============================
// 🔧 기본 설정
// ==============================
const SERVER_URL = "https://account-storage-p06t.onrender.com"; // Render 배포 주소로 바꿔

const pages = {
  home: document.querySelector("#home"),
  admin: document.querySelector("#admin"),
  advanced: document.querySelector("#advanced"),
};

const title = document.querySelector("#home-title");
const adminLink = document.querySelector("#adminLink");
const goAdvancedBtn = document.querySelector("#goAdvanced");
const backToAdminBtn = document.querySelector("#backToAdmin");

const homeSearch = document.querySelector(".home-search");
const searchInput = homeSearch.querySelector("input");
const searchButton = homeSearch.querySelector("button");

const form = document.querySelector("form");
const inputs = form.querySelectorAll("input");
const selectName = form.querySelector("#userSelect");
const listContainer = document.querySelector(".account-list");
const pwInput = document.querySelector("#pwInput");
const togglePw = document.querySelector("#togglePw");

const advList = document.querySelector("#advAccountList");
const newUserInput = document.querySelector("#newUserName");
const addUserBtn = document.querySelector("#addUserBtn");
const userListDiv = document.querySelector("#userList");

const confirmBox = document.querySelector("#confirmBox");
const confirmDeleteBtn = document.querySelector("#confirmDelete");
const cancelDeleteBtn = document.querySelector("#cancelDelete");

let deleteIndex = null;

// ==============================
// 🔄 사용자 이름 관리 (localStorage 유지)
// ==============================
const USER_KEY = "userList";
const getUsers = () => JSON.parse(localStorage.getItem(USER_KEY) || '["민규","윤정"]');
const saveUsers = (d) => localStorage.setItem(USER_KEY, JSON.stringify(d));

function refreshUserSelect() {
  const users = getUsers();
  selectName.innerHTML =
    '<option value="">사용자 이름 선택</option>' +
    users.map((u) => `<option value="${u}">${u}</option>`).join("");
}

// ==============================
// 📄 페이지 전환
// ==============================
function showPage(page) {
  Object.values(pages).forEach((p) => (p.style.display = "none"));
  pages[page].style.display = "block";
}

// ✅ 관리자 페이지 이동
adminLink.addEventListener("click", (e) => {
  e.preventDefault();
  showPage("admin");
  renderAccounts();
});

// ✅ 고급 관리자 페이지 이동
goAdvancedBtn.addEventListener("click", (e) => {
  e.preventDefault();
  showPage("advanced");
  renderAdvList();
  renderUserList();
});

// ✅ 고급 관리자 → 관리자 페이지로 돌아가기
backToAdminBtn?.addEventListener("click", () => showPage("admin"));

// ✅ 제목 클릭 시 새로고침
title.addEventListener("click", () => {
  document.body.style.transition = "opacity 0.5s ease";
  document.body.style.opacity = "0";
  setTimeout(() => window.location.reload(), 500);
});

// ==============================
// 👁️ 비밀번호 토글
// ==============================
togglePw.addEventListener("click", () => {
  const type = pwInput.getAttribute("type");
  pwInput.setAttribute("type", type === "password" ? "text" : "password");
  togglePw.textContent = type === "password" ? "🙈" : "👁️";
});

// ==============================
// 💾 계정 등록 (서버 저장)
// ==============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const site = inputs[0].value.trim();
  const name = selectName.value.trim();
  const id = inputs[1].value.trim();
  const pw = pwInput.value.trim();
  if (!site || !name || !id || !pw)
    return alert("모든 항목을 입력하세요.");

  try {
    await fetch(`${SERVER_URL}/addAccount`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site, name, id, pw }),
    });

    form.reset();
    renderAccounts();
    alert(`${site} 계정이 등록되었습니다 ✅`);
  } catch {
    alert("❌ 서버에 연결할 수 없습니다.");
  }
});

// ==============================
// 📜 히스토리 (서버에서 불러오기)
// ==============================
// ✅ 전체 계정 불러오기 (히스토리용)
async function renderAccounts() {
  try {
    const res = await fetch(`${SERVER_URL}/getAccounts`);
    const accounts = await res.json();

    const listArea = listContainer.querySelector("div:last-child");
    listArea.innerHTML = accounts.length
      ? accounts.map(
          (acc) => `<div>${acc["02_사이트"]} [${acc["01_사용자이름✅"]}]</div>`
        ).join("")
      : "<div>등록된 계정이 없습니다.</div>";
  } catch {
    console.error("⚠️ 서버 연결 실패");
  }
}

// ✅ 고급 관리자용 카드 리스트
async function renderAdvList() {
  try {
    const res = await fetch(`${SERVER_URL}/getAccounts`);
    const accounts = await res.json();

    advList.innerHTML = accounts.length
      ? accounts.map(
          (acc) => `
        <div class="account-card">
          <h4>${acc["02_사이트"]}</h4>
          <p><b>사용자:</b> ${acc["01_사용자이름✅"]}</p>
          <p><b>아이디:</b> ${acc["03_아이디"]}</p>
          <p><b>비밀번호:</b> ${acc["04_패스워드"]}</p>
          <div class="card-buttons">
            <button class="submit" onclick="editAccount('${acc.id}')">수정</button>
            <button class="submit" style="background:#ff3b30" onclick="confirmDelete('${acc.id}')">삭제</button>
          </div>
        </div>`
        ).join("")
      : "<div>등록된 계정이 없습니다.</div>";
  } catch {
    advList.innerHTML = "<div>❌ 서버 연결 실패</div>";
  }
}

// ==============================
// 🗑️ 삭제 확인창
// ==============================
window.confirmDelete = async (id) => {
  const confirmContent = confirmBox.querySelector(".confirm-content p");
  confirmContent.textContent = "등록된 계정을 삭제하시겠습니까?";
  confirmBox.classList.remove("hidden");

  confirmDeleteBtn.onclick = async () => {
    try {
      await fetch(`${SERVER_URL}/deleteAccount/${id}`, { method: "DELETE" });
      alert("✅ 계정이 정상적으로 삭제되었습니다");
      confirmBox.classList.add("hidden");
      renderAdvList();
      renderAccounts();
    } catch {
      alert("❌ 삭제 실패 (서버 오류)");
    }
  };

  cancelDeleteBtn.onclick = () => {
    confirmBox.classList.add("hidden");
    alert("삭제가 취소되었습니다 ❌");
  };
};

// ==============================
// ✏️ 수정 기능 (수정 후 저장)
// ==============================
window.editAccount = (id) => {
  alert("현재 버전에서는 수정 기능이 준비 중입니다.");
};

// ==============================
// 👤 사용자 관리 (LocalStorage)
// ==============================
function renderUserList() {
  const users = getUsers();
  userListDiv.innerHTML = users
    .map(
      (u, i) => `
        <div class="user-item">
          <span class="user-name">${u}</span>
          <button class="delete-btn" onclick="deleteUser(${i})">삭제</button>
        </div>`
    )
    .join("");
}

addUserBtn.addEventListener("click", () => {
  const val = newUserInput.value.trim();
  if (!val) return;
  const users = getUsers();
  users.push(val);
  saveUsers(users);
  newUserInput.value = "";
  renderUserList();
  refreshUserSelect();
});

window.deleteUser = (i) => {
  const users = getUsers();
  const userName = users[i];
  const confirmDelete = confirm(`정말 '${userName}' 사용자를 삭제하시겠습니까?`);
  if (confirmDelete) {
    users.splice(i, 1);
    saveUsers(users);
    renderUserList();
    refreshUserSelect();
    alert(`'${userName}' 정상적으로 삭제되었습니다 ✅`);
  } else alert("삭제가 취소되었습니다 ❌");
};

// ==============================
// 🔍 검색
// ==============================
searchButton.addEventListener("click", async () => {
  const query = searchInput.value.trim();
  if (!query) return alert("검색어를 입력하세요.");

  const res = await fetch(`${SERVER_URL}/getAccounts`);
  const accounts = await res.json();
  const found = accounts.filter((acc) => acc.site.includes(query));

  if (!found.length) return alert(`'${query}' 관련 계정이 없습니다.`);
  alert(
    found
      .map(
        (acc) =>
          `사이트: ${acc.site}\n이름: ${acc.name}\n아이디: ${acc.id}\n비밀번호: ${acc.pw}`
      )
      .join("\n\n")
  );
});

refreshUserSelect();
