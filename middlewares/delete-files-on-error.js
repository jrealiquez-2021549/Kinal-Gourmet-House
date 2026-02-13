import { cloudinary } from "./file-uploader.js";

export const cleanUploaderFile = async(req, res, next)=>{
    if(req.file){
        res.on('finish', async()=>{
            try {
                if(res.statusCode >= 400) {
                    const publicId = req.file.public_id || req.file.filename;
                    if(publicId){
                        await cloudinary.uploader.destroy(publicId);
                        console.log(
                            `Imagen de Cloudinary eliminada ${res.statusCode}: ${publicId}`
                        )
                    }
                }
            } catch (error) {
                console.error(`Error al eliminar Imagen de Cloudinary: ${e.message}`);
            }
        })
    }
    next();
}

export const deleteFileOnError = async (err, req, res, next) => {
    try {
        if(req.file) {
            const publicId = req.file.public_id || req.file.filename;
            if(publicId){
                await cloudinary.uploader.destroy(publicId);
                console.log(
                    `Imagen Cloudinary eliminada por error en cadena: ${publicId}`
                )
            }
        }
    } catch (error) {
        console.error(`Error al eliminar Imagen de Cloudinary (error handler): ${error.message}`)
    }
    return next(err);
}