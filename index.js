import express from "express";
import dotenv from "dotenv";
import dbConnect from "./config/db.js";
import chalk from "chalk";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareasRoutes from "./routes/tareaRoutes.js";
import cors from "cors";
const app = express();

dotenv.config();
app.use(express.json());

//Confingurar CORS
const whitelist = [
  process.env.FRONTEND_URL,
  "http://localhost:4000",
  "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log(origin);
    if (whitelist.includes(origin)) {
      //Puede Consultar la API
      callback(null, true);
    } else {
      //No Esta permitido Usar la Api
      callback(new Error("Error de Cors"));
    }
  },
};
// app.use(cors(corsOptions));
app.use(cors());

dbConnect();

//Routing
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/proyectos", proyectoRoutes);
app.use("/api/tareas", tareasRoutes);

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(chalk.inverse.yellow(`Servidor Corriendo en el puerto ${PORT}`));
});

// Socket.io

import { Server } from "socket.io";

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

io.on("connection", (socket) => {
  console.log("Conectado a Socket.io");

  // Definir los evenetos de Socket.io

  socket.on("abrir proyecto", (proyectoID) => {
    console.log(proyectoID, "Soy el Id del proyecto");
    socket.join(proyectoID);
  });

  socket.on("nueva tarea", (tarea) => {
    console.log(tarea);
    const proyecto = tarea.proyecto;
    console.log(proyecto);
    socket.to(proyecto).emit("tarea agregada", tarea);
  });

  socket.on("eliminar tarea", (tarea) => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit("tarea eliminada", tarea);
  });

  socket.on("actualizar tarea", (tareaActualizada) => {
    const proyecto = tareaActualizada.proyecto._id;
    socket.to(proyecto).emit("tarea actualizada", tareaActualizada);
  });

  socket.on("Cambiar estado tarea", (tarea) => {
    const proyecto = tarea.proyecto._id;
    socket.to(proyecto).emit("estado cambiado tarea", tarea);
  });
});
