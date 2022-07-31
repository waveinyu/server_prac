const express = require("express");
const mongoose = require("mongoose");
// const user = require("./models/user.js");
const port = 3000;
const User = require("./models/user.js");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middlewares/auth-middleware.js");

const app = express();
const router = express.Router();

mongoose.connect("mongodb://localhost/shopping-demo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

// 회원가입 API
router.post("/users", async (req, res) => {
  const { nickname, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    res.status(400).send({ errorMessage: "비밀번호가 일치하지 않습니다." });
    return;
  }
  const existUser = await User.find({
    $or: [{ email }, { nickname }], // 조건
  });
  if (existUser.length) {
    res.status(400).send({
      errorMessage: "이미 존재하는 이메일 또는 닉네임이 있습니다.",
    });
    return;
  }

  const user = new User({ email, nickname, password });
  await user.save();

  res.status(201).send({}); // 200도 좋지만, REST API에 따라 201(Create 성공) 코드 입력
});

// 로그인 API
router.post("/auth", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password }).exec();

  if (!user) {
    res.status(401).send({ errorMessage: "일치하는 정보가 없습니다." }); // 400도 있지만, REST API에 따라 401(인증 실패)
    return;
  }

  // 로그인 성공했을 때 [토큰 생성, JWT 라이브러리 불러오기]
  const token = jwt.sign({ userId: user.userId }, "yuyu");
  res.send({
    token, // JWT를 반환해야 정상적으로 프론트엔드에서 작동할 수 있도록 구현
  });
}); // 내 정보 조회 API가 있어야 성공적으로 로그인을 할 수 있다. 지금은 반쪽만 된 상태

// 사용자 인증 미들웨어
router.get("/users/me", authMiddleware, async (req, res) => {
  console.log(res.locals);
  res.status(400).send({});
});

app.use("/api", express.urlencoded({ extended: false }), router);
app.use(express.static("assets"));

app.listen(port, () => {
  console.log("3000 포트에 접속했어요@.@");
});
