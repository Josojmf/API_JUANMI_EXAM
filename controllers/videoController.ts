// controllers/videoController.ts
import { videosCollection } from "../db/mongo.ts";
import { isAuthenticated } from "../middleware/auth.ts";
import { ObjectId } from "../deps.ts";

export async function getVideos(req: Request): Promise<Response> {
  const auth = await isAuthenticated(req);
  if (!auth) return new Response("Unauthorized", { status: 401 });

  try {
    const videos = await videosCollection.find({}).toArray();
    return new Response(JSON.stringify(videos), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error al obtener videos:", error);
    return new Response("Error interno del servidor", { status: 500 });
  }
}

export async function addVideo(req: Request): Promise<Response> {
  const auth = await isAuthenticated(req);
  if (!auth) return new Response("Unauthorized", { status: 401 });

  try {
    const data = await req.json();
    if (!data.title || !data.url) {
      return new Response("Faltan datos requeridos: title y url", { status: 400 });
    }

    const videoData = {
      title: data.title,
      url: data.url,
      description: data.description || "",
      uploadedBy: auth.email, // Usar email en lugar de username
      uploadedAt: new Date(),
      tags: data.tags || []
    };

    await videosCollection.insertOne(videoData);
    return new Response("Video añadido correctamente", { status: 201 });
  } catch (error) {
    console.error("Error al añadir video:", error);
    return new Response("Error interno del servidor", { status: 500 });
  }
}

export async function updateVideo(req: Request): Promise<Response> {
  const auth = await isAuthenticated(req);
  if (!auth) return new Response("Unauthorized", { status: 401 });

  try {
    const url = new URL(req.url);
    const videoId = url.pathname.split('/').pop();

    if (!videoId) {
      return new Response("ID de video requerido", { status: 400 });
    }

    // Verificar que el ID es válido
    if (!ObjectId.isValid(videoId)) {
      return new Response("ID de video inválido", { status: 400 });
    }

    const data = await req.json();
    
    // Verificar que el video existe y pertenece al usuario
    const existingVideo = await videosCollection.findOne({ 
      _id: new ObjectId(videoId),
      uploadedBy: auth.email 
    });

    if (!existingVideo) {
      return new Response("Video no encontrado o no tienes permisos", { status: 404 });
    }

    // Preparar datos para actualizar (solo campos permitidos)
    const updateData: any = {
      updatedAt: new Date()
    };

    if (data.title) updateData.title = data.title;
    if (data.url) updateData.url = data.url;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.tags) updateData.tags = data.tags;

    const result = await videosCollection.updateOne(
      { _id: new ObjectId(videoId) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return new Response("No se realizaron cambios", { status: 200 });
    }

    return new Response("Video actualizado correctamente", { status: 200 });
  } catch (error) {
    console.error("Error al actualizar video:", error);
    return new Response("Error interno del servidor", { status: 500 });
  }
}

export async function deleteVideo(req: Request): Promise<Response> {
  const auth = await isAuthenticated(req);
  if (!auth) return new Response("Unauthorized", { status: 401 });

  try {
    const url = new URL(req.url);
    const videoId = url.pathname.split('/').pop();

    if (!videoId) {
      return new Response("ID de video requerido", { status: 400 });
    }

    // Verificar que el ID es válido
    if (!ObjectId.isValid(videoId)) {
      return new Response("ID de video inválido", { status: 400 });
    }

    // Verificar que el video existe y pertenece al usuario
    const existingVideo = await videosCollection.findOne({ 
      _id: new ObjectId(videoId),
      uploadedBy: auth.email 
    });

    if (!existingVideo) {
      return new Response("Video no encontrado o no tienes permisos", { status: 404 });
    }

    const result = await videosCollection.deleteOne({ 
      _id: new ObjectId(videoId) 
    });

    if (result.deletedCount === 0) {
      return new Response("No se pudo eliminar el video", { status: 500 });
    }

    return new Response("Video eliminado correctamente", { status: 200 });
  } catch (error) {
    console.error("Error al eliminar video:", error);
    return new Response("Error interno del servidor", { status: 500 });
  }
}