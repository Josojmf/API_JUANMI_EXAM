import { getVideos, addVideo } from "../controllers/videoController.ts";

export async function videoRoutes(req: Request): Promise<Response | null> {
  const { method } = req;
  const pathname = new URL(req.url).pathname;

  if (method === "GET" && pathname === "/videos") return await getVideos(req);
  if (method === "POST" && pathname === "/videos") return await addVideo(req);

  return null;
}
