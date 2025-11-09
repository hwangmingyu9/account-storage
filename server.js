// ==============================
// 🚀 account-storage 서버 (Render + Firebase 완전버전)
// ==============================
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

// ==============================
// ⚙️ 기본 설정
// ==============================
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Render용 경로 설정 (index.html 제공)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==============================
// 🔥 Firebase 연결
// ==============================
const firebaseConfig = {
  apiKey: "AIzaSyA-Nh8kunTjGncNwJmwzPwhxR2Py8LLWEo",
  authDomain: "account-storage-77627.firebaseapp.com",
  projectId: "account-storage-77627",
  storageBucket: "account-storage-77627.firebasestorage.app",
  messagingSenderId: "448772525311",
  appId: "1:448772525311:web:a2db78ddde7e217f08d0ca"
};

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);

// 🔹 컬렉션 이름들
const ACCOUNTS = "계정_정보";
const USERS = "계정_사용자";

// ==============================
// 💾 계정 등록
// ==============================
app.post("/addAccount", async (req, res) => {
  try {
    const { site, name, id, pw } = req.body;
    await addDoc(collection(db, ACCOUNTS), {
      "01_사용자이름✅": name,
      "02_사이트": site,
      "03_아이디": id,
      "04_패스워드": pw,
    });
    res.json({ success: true, message: "✅ 계정 저장 완료" });
  } catch (e) {
    console.error("❌ 저장 실패:", e);
    res.status(500).json({ error: "저장 실패" });
  }
});

// ==============================
// 📋 계정 목록 불러오기
// ==============================
app.get("/getAccounts", async (req, res) => {
  try {
    const snap = await getDocs(collection(db, ACCOUNTS));
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(data);
  } catch (e) {
    console.error("❌ 불러오기 실패:", e);
    res.status(500).json({ error: "불러오기 실패" });
  }
});

// ==============================
// ✏️ 계정 수정
// ==============================
app.put("/updateAccount/:id", async (req, res) => {
  try {
    const { site, name, id, pw } = req.body;
    await updateDoc(doc(db, ACCOUNTS, req.params.id), {
      "01_사용자이름✅": name,
      "02_사이트": site,
      "03_아이디": id,
      "04_패스워드": pw,
    });
    res.json({ success: true, message: "✅ 수정 완료" });
  } catch (e) {
    console.error("❌ 수정 실패:", e);
    res.status(500).json({ error: "수정 실패" });
  }
});

// ==============================
// 🗑️ 계정 삭제
// ==============================
app.delete("/deleteAccount/:id", async (req, res) => {
  try {
    await deleteDoc(doc(db, ACCOUNTS, req.params.id));
    res.json({ success: true, message: "✅ 계정 삭제 완료" });
  } catch (e) {
    console.error("❌ 삭제 실패:", e);
    res.status(500).json({ error: "삭제 실패" });
  }
});

// ==============================
// 👤 사용자 추가 (계정_사용자 컬렉션)
// ==============================
app.post("/addUser", async (req, res) => {
  try {
    const { 이름 } = req.body;
    await addDoc(collection(db, USERS), {
      "등록된 사용자 ✅": true,
      이름,
    });
    res.json({ success: true, message: "✅ 사용자 등록 완료" });
  } catch (e) {
    console.error("❌ 사용자 추가 실패:", e);
    res.status(500).json({ error: "등록 실패" });
  }
});

// ==============================
// 📜 사용자 목록 불러오기
// ==============================
app.get("/getUsers", async (req, res) => {
  try {
    const snap = await getDocs(collection(db, USERS));
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(data);
  } catch (e) {
    console.error("❌ 사용자 목록 불러오기 실패:", e);
    res.status(500).json({ error: "불러오기 실패" });
  }
});

// ==============================
// 🗑️ 사용자 삭제
// ==============================
app.delete("/deleteUser/:id", async (req, res) => {
  try {
    await deleteDoc(doc(db, USERS, req.params.id));
    res.json({ success: true, message: "✅ 사용자 삭제 완료" });
  } catch (e) {
    console.error("❌ 사용자 삭제 실패:", e);
    res.status(500).json({ error: "삭제 실패" });
  }
});

// ==============================
// 🏠 index.html 서빙
// ==============================
app.use(express.static(__dirname));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ==============================
// 🚀 Render 서버 시작
// ==============================
app.listen(process.env.PORT || 3000, () => {
  console.log("✅ account-storage 서버 실행 중 (컬렉션: 계정_정보 + 계정_사용자)");
});
