import {Router} from "express"
import { loginUser, registerUser , logoutUser, refreshAccessToken } from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),  // middleware
    registerUser
)
router.route('/login').post(loginUser)

//secure routes 
// give acess to logout when user is login
//verify using jwt tokens and cookies
//inject middleware in  logout route

router.route('/logout').post(
    verifyJWT,
    logoutUser
)
// router can confuse what to do after running verifyJWT , that's why
// we write next() in auth middleware so that after running verifyjwt it run logout user



router.route("/refresh-token").post(refreshAccessToken)


export default router