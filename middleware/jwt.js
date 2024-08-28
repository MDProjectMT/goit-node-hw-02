import passport from "passport";

const authMiddleware = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (error, user) => {
    if (!user || error) {
      return res.status(401).json({
        status: "401 Unauthorized",
        code: 401,
        message: "Not authorized",
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

export default authMiddleware;

// // w nagrywanych wykładach:
//     if (!user || error) {
//       return res.status(401).json({
//         status: "error",
//         code: 401,
//         message: "Unauthorized",
//         data: "Unauthorized",
//       });
//     }
//     res.locals.user = user; DLACZEGO???!!!
//     next();
//   })(req, res, next);
