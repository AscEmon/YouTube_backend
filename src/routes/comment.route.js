import { Router } from 'express';
import {
    createComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/")
    .get(getVideoComments)
    .post(createComment);

router
    .route("/:commentId")
    .delete(deleteComment)
    .patch(updateComment);

export default router;