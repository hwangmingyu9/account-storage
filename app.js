// ==============================
// 🔧 기본 설정
// ==============================
const SERVER_URL = "https://account-storage-p06t.onrender.com";

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
const selectName = document.querySelector("#userSelect");
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

const editModal = document.querySelector("#editModal");
const editSite = document.querySelector("#editSite");
const editName = document.querySelector("#editName");
const editId = document.querySelector("#editId");
const editPw = document.querySelector("#editPw");
const saveEditBtn = document.querySelector("#saveEdit");
const cancelEditBtn = document.querySelector("#cancelEdit");
const closeEditBtn = document.querySelector("#closeEdit");

let editingId = null;

// ==============================
// 📄 페이지 전환
// ==============================
function showPage(page) {
  Object.values(pages).forEach((p) => (p.style.display = "none"));
  pages[page].style.display = "block";
}

adminLink.addEventListener("click", (e) => {
  e.preventDefault();
  showPage("admin");
  renderAccounts();
});

goAdvancedBtn.addEventListener("click", (e) => {
  e.preventDefault();
  showPage("advanced");
  renderAdvList();
  renderUserList();
});

backToAdminBtn.addEventListener("click", () => showPage("admin"));
title.addEventListener("click", () => location.reload());

// ==============================
// 👁️ 비밀번호 보기
// ==============================
togglePw.addEventListener("click", () => {
  const type = pwInput.getAttribute("type");
  pwInput.setAttribute("type", type === "password" ? "text" : "password");
  togglePw.textContent = type === "password" ? "🙈" : "👁️";
});

// ==============================
// 💾 계정 추가
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
    alert("❌ 서버 연결 실패");
  }
});

// ==============================
// 📋 계정 목록
// ==============================
async function renderAccounts() {
  const res = await fetch(`${SERVER_URL}/getAccounts`);
  const data = await res.json();
  const list = listContainer.querySelector("div:last-child");
  list.innerHTML = data.length
    ? data.map((a) => `<div>${a["02_사이트"]} [${a["01_사용자이름✅"]}]</div>`).join("")
    : "<div>등록된 계정이 없습니다.</div>";
}

async function renderAdvList() {
  const res = await fetch(`${SERVER_URL}/getAccounts`);
  const data = await res.json();
  advList.innerHTML = data.length
    ? data.map(
        (a) => `
        <div class="account-card">
          <h4>${a["02_사이트"]}</h4>
          <p><b>사용자:</b> ${a["01_사용자이름✅"]}</p>
          <p><b>아이디:</b> ${a["03_아이디"]}</p>
          <p><b>비밀번호:</b> ${a["04_패스워드"]}</p>
          <div class="card-buttons">
            <button class="submit" onclick="editAccount('${a.id}')">수정</button>
            <button class="submit" style="background:#ff3b30" onclick="confirmDelete('${a.id}')">삭제</button>
          </div>
        </div>`
      ).join("")
    : "<div>등록된 계정이 없습니다.</div>";
}

// ==============================
// 🗑️ 계정 삭제
// ==============================
window.confirmDelete = (id) => {
  confirmBox.classList.remove("hidden");
  confirmDeleteBtn.onclick = async () => {
    await fetch(`${SERVER_URL}/deleteAccount/${id}`, { method: "DELETE" });
    alert("✅ 삭제 완료");
    confirmBox.classList.add("hidden");
    renderAdvList();
    renderAccounts();
  };
  cancelDeleteBtn.onclick = () => confirmBox.classList.add("hidden");
};

// ==============================
// ✏️ 수정
// ==============================
window.editAccount = async (id) => {
  const res = await fetch(`${SERVER_URL}/getAccounts`);
  const data = await res.json();
  const t = data.find((a) => a.id === id);
  if (!t) return alert("❌ 찾을 수 없음");
  editSite.value = t["02_사이트"];
  editName.value = t["01_사용자이름✅"];
  editId.value = t["03_아이디"];
  editPw.value = t["04_패스워드"];
  editingId = id;
  editModal.classList.remove("hidden");
};

saveEditBtn.addEventListener("click", async () => {
  const site = editSite.value.trim();
  const name = editName.value.trim();
  const id = editId.value.trim();
  const pw = editPw.value.trim();
  await fetch(`${SERVER_URL}/updateAccount/${editingId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ site, name, id, pw }),
  });
  alert("✅ 수정 완료");
  editModal.classList.add("hidden");
  renderAdvList();
});

cancelEditBtn.addEventListener("click", () => editModal.classList.add("hidden"));
closeEditBtn.addEventListener("click", () => editModal.classList.add("hidden"));

// ==============================
// 👤 사용자 관리 (DB 연동)
// ==============================
addUserBtn.addEventListener("click", async () => {
  const name = newUserInput.value.trim();
  if (!name) return alert("이름을 입력하세요.");
  await fetch(`${SERVER_URL}/addUser`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      "등록된 사용자 ✅": true,
      이름: name,
    }),
  });
  alert(`✅ '${name}' 등록됨`);
  newUserInput.value = "";
  renderUserList();
});

async function renderUserList() {
  const res = await fetch(`${SERVER_URL}/getUsers`);
  const users = await res.json();
  userListDiv.innerHTML = users.length
    ? users
        .map(
          (u) => `
      <div class="user-item">
        <span>${u["이름"]}</span>
        <button class="delete-btn" onclick="deleteUser('${u.id}')">삭제</button>
      </div>`
        )
        .join("")
    : "<div>등록된 사용자가 없습니다.</div>";
}

window.deleteUser = async (id) => {
  await fetch(`${SERVER_URL}/deleteUser/${id}`, { method: "DELETE" });
  alert("✅ 삭제 완료");
  renderUserList();
};

// ==============================
// 🔍 검색
// ==============================
searchButton.addEventListener("click", async () => {
  const q = searchInput.value.trim();
  if (!q) return alert("검색어를 입력하세요.");
  const res = await fetch(`${SERVER_URL}/getAccounts`);
  const data = await res.json();
  const found = data.filter((a) => (a["02_사이트"] || "").includes(q));
  if (!found.length) return alert(`'${q}' 해당 검색어 계정 관련 없음`);
  alert(
    found
      .map(
        (a) =>
          `사이트: ${a["02_사이트"]}\n이름: ${a["01_사용자이름✅"]}\n아이디: ${a["03_아이디"]}\n비밀번호: ${a["04_패스워드"]}`
      )
      .join("\n\n")
  );
});

// ==============================
// ⌨️ Enter키 작동 추가
// ==============================

// 홈 페이지 → Enter = 검색 실행
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchButton.click();
  }
});

// 관리자 페이지 → Enter = 계정 추가
form.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    form.querySelector("button.submit").click();
  }
});

// 고급 관리자 페이지 → 수정 모달 Enter = 저장
editModal.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    saveEditBtn.click();
  }
});

// 고급 관리자 페이지 → 새 사용자 추가 입력창 Enter = 추가
newUserInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addUserBtn.click();
  }
});

renderUserList();
renderAccounts();
