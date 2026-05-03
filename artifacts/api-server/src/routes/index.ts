import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import classesRouter from "./classes";
import studentsRouter from "./students";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/classes", classesRouter);
router.use("/students", studentsRouter);
router.use("/admin", adminRouter);
router.use("/admin/teachers", adminRouter);

export default router;
