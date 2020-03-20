const fs = require("mz/fs");
const error = require("./error.middleware");

const photoPath = "storage/photos/";

exports.savePhoto = async function(image, filename)
{
    console.log(image, filename)
    const path = photoPath + filename;
    const replaced = await fs.exists(path);
    
    await fs.writeFile(path, image);

    return replaced;
}

exports.loadPhoto = async function(filename)
{
    const path = photoPath + filename;

    if (await fs.exists(path)) {
        const image = await fs.readFile(path);
    
        //read the file headers to determine MIME type
        let mimeType = image.slice(0, 4).toString("hex");
        switch (mimeType) {
        case "89504e47":
            mimeType = "image/png";
            break;
        case "47494638":
            mimeType = "image/gif";
            break;
        case "ffd8ffe0":
        case "ffd8ffe1":
        case "ffd8ffe2":
        case "ffd8ffe3":
        case "ffd8ffe8":
            mimeType = "image/jpeg";
            break;
        default:
            throw new error.BadRequest("given file is not a supported image type");
        }

        return { data: image, type: mimeType };
    } else {
        throw new error.NotFound(`image file ${path} does not exist`);
    }
}

exports.deletePhoto = function(filename)
{
    return exports.delete(photoPath + filename);
}

exports.delete = async function(filePath) 
{
    try {
        await fs.unlink(filePath);
    } catch (err) {
        throw new error.NotFound(err.message);
    }
}