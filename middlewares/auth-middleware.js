//로그인이 된 후(아이디 비밀번호를 디비에서 확인 후) 진짜 사용자가 맞는지 토큰을 검사
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

module.exports = (req, res, next) => {
  console.log("미들웨어를 지나쳤어요~");
  const { authorization } = req.headers;
  //   console.log(authorization);
  const [tokenType, tokenValue] = authorization.split(" ");

  if (tokenType !== "Bearer") {
    // token이 정상적인지 확인(token이 없는 경우도 확인)
    res.status(401).send({
      errorMessage: "로그인 후 사용하세요",
    });
    return; // tokenType이 Bearer가 아니면, next()로 넘어가지 못하게 막는다
  }
  try {
    const { userId } = jwt.verify(tokenValue, "yuyu");

    // const user = User.findById(userId)
    User.findById(userId)
      .exec()
      .then((user) => {
        res.locals.user = user;
        next(); // 미들웨어에 next()는 반드시 필요
      });
    // user가 항상 있다고 가정을 하고, user를 locals에 담는데
    // 이 미들웨어를 쓰는 다른 곳에서도 공통적으로 사용할 수 있어서 편리하게 쓸 수 있다.
  } catch (error) {
    res.status(401).send({
      errorMessage: "로그인 후 사용하세요",
    });
    return;
  }
  console.log(tokenValue);
};

// res.locals.user = user
// 미들웨어에 저렇게 담아 놓으면 항상 사용자 정보가 들어 있는 상태로 API를 구현하면 된다.
