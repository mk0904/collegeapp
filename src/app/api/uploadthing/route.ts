import { createUploadthing, type FileRouter } from "uploadthing/next";
import { createRouteHandler } from "uploadthing/next";

const f = createUploadthing({
  secret: process.env.UPLOADTHING_TOKEN,
});

export const ourFileRouter = {
  circularUploader: f({ 
    image: { maxFileSize: "4MB", maxFileCount: 10 },
    pdf: { maxFileSize: "16MB", maxFileCount: 10 },
    video: { maxFileSize: "32MB", maxFileCount: 5 },
    blob: { maxFileSize: "16MB", maxFileCount: 10 } // For other file types
  })
    .middleware(() => {
      return {};
    })
    .onUploadComplete(() => {
      return {};
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

// Export the route handler
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
