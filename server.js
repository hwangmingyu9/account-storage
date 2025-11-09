import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Firebase 연결
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

// ✅ 계정 등록
app.post("/addAccount", async (req, res) => {
  try {
    const { site, name, id, pw } = req.body;
    await addDoc(collection(db, "accounts"), { site, name, id, pw });
    res.json({ success: true });
  } catch (e) {
    console.error("❌ 저장 실패:", e);
    res.status(500).json({ error: "저장 실패" });
  }
});

// ✅ 전체 계정 불러오기
app.get("/getAccounts", async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, "accounts"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(data);
  } catch (e) {
    console.error("❌ 불러오기 실패:", e);
    res.status(500).json({ error: "불러오기 실패" });
  }
});

// ✅ 계정 삭제
app.delete("/deleteAccount/:id", async (req, res) => {
  try {
    await deleteDoc(doc(db, "accounts", req.params.id));
    res.json({ success: true });
  } catch (e) {
    console.error("❌ 삭제 실패:", e);
    res.status(500).json({ error: "삭제 실패" });
  }
});

// ✅ Render 환경 포트 대응
app.listen(process.env.PORT || 3000, () =>
  console.log("✅ account-storage 서버 실행 중")
);
