import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import exampleRoute from "./routes/exampleRoute";
import bookRoutes from "./routes/bookRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import studentRoutes from "./routes/studentRoutes";
import morgan from "morgan";
import helmet from "helmet";
import bookingRoutes from "./routes/bookingRoutes";
import cookieParser from "cookie-parser";
import http from "http";
import { Server, Socket } from "socket.io";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import {options} from "./options";
import swaggerJsdoc from "swagger-jsdoc";

export const app: Application = express();

app.use(
  cors({
    origin: true,
    methods: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());
app.use(cookieParser());
app.use(express.urlencoded({ limit: "50mb", extended: true }));
dotenv.config();

/* Socket.io initialization */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    allowedHeaders: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  },

  /* path: "/socket" */
});

io.on("connection", (socket: Socket) => {
  console.log("Connection work");
  console.log(`⚡: ${socket.id} user just connected!`);
  io.on("disconnect", () => {
    console.log("🔥: A user disconnected");
  });
});

const PORT = process.env.PORT as unknown as number;

app.use(exampleRoute);
app.use(bookRoutes);
app.use(categoryRoutes);
app.use(studentRoutes);
app.use(bookingRoutes);

const specs = swaggerJsdoc(options);
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCssUrl:
      "https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-newspaper.css",
  })
);

server.listen(PORT, () => {
  console.log(`Applikácia beží na porte ${PORT}`);
});
