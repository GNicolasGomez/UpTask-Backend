import mongoose from "mongoose";
import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";

const agregarTarea = async (req, res) => {
  const { proyecto } = req.body;

  const existeProyecto = await Proyecto.findById(proyecto);
  if (!existeProyecto) {
    const error = new Error("El proyecto no existe");
    return res.status(404).json({ msg: error.message });
  }
  if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error(
      "No tienes permiso de añadir tarea, No es tu proyecto"
    );
    return res.status(404).json({ msg: error.message });
  }

  try {
    const tareaAlmacenada = await Tarea.create(req.body);
    //Almacenar el ID en el proyecto
    existeProyecto.tareas.push(tareaAlmacenada._id);
    await existeProyecto.save();
    res.json(tareaAlmacenada);
  } catch (error) {
    console.log(error);
  }
};
const obtenerTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate("proyecto");

  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    //TODO:req.usuario._id ese el usuario autenticado que viene de checkJWT
    const error = new Error(
      "No tienes permiso de añadir tarea, No es tu proyecto"
    );
    return res.status(403).json({ msg: error.message });
  }

  res.json(tarea);
};
const actualizarTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate("proyecto");

  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    //TODO:req.usuario._id ese el usuario autenticado que viene de checkJWT
    const error = new Error(
      "No tienes permiso de añadir tarea, No es tu proyecto"
    );
    return res.status(403).json({ msg: error.message });
  }

  tarea.nombre = req.body.nombre || tarea.nombre;
  tarea.descripcion = req.body.descripcion || tarea.descripcion;
  tarea.prioridad = req.body.prioridad || tarea.prioridad;
  tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

  try {
    const tareaAlmacenada = await tarea.save();
    res.json(tareaAlmacenada);
  } catch (error) {
    console.log(error);
  }
};
const eliminatTarea = async (req, res) => {
  const { id } = req.params;
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) {
    const error = new Error("TAREA INEXISTENTE");
    return res.status(404).json({ msg: error.message });
  }

  const tarea = await Tarea.findById(id).populate("proyecto");

  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    //TODO:req.usuario._id ese el usuario autenticado que viene de checkJWT
    const error = new Error(
      "No tienes permiso de añadir tarea, No es tu proyecto"
    );
    return res.status(403).json({ msg: error.message });
  }

  try {
    const proyecto = await Proyecto.findById(tarea.proyecto);
    proyecto.tareas.pull(tarea._id);

    //Como tenemos 2 promesas lo encapsulamos en 2
    await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()]);

    res.json({ msg: "La tarea se eliminó correctamente" });
  } catch (error) {
    console.log(error);
  }
};

const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) {
    const error = new Error("TAREA INEXISTENTE");
    return res.status(404).json({ msg: error.message });
  }

  const tarea = await Tarea.findById(id).populate("proyecto")



  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }
  // El que puede marcar como completa/incompleta una tarea es solamente el dueño o colaborador del proyecto

  if (
    tarea.proyecto.creador.toString() !== req.usuario._id.toString() &&
    !tarea.proyecto.colaboradores.some(
      (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
    )
  ) {
    const error = new Error('Accion no Válida, no estas en el proyecto');
    return res.status(404).json({msg : error.message});

  }

  tarea.estado = !tarea.estado;
  tarea.completado = req.usuario._id;
  await tarea.save();

  const tareaAlmacenada = await Tarea.findById(id).populate('proyecto').populate('completado');

  res.json(tareaAlmacenada);

};

export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminatTarea,
  cambiarEstado,
};
