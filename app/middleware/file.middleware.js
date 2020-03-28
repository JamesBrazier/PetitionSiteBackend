const fs = require("mz/fs");
const error = require("./error.middleware");

const photoPath = "storage/photos/";

exports.saveBodyPhoto = async function(req, filename)
{
    let content = req.get("Content-Type");

    if (!["image/png", "image/jpeg", "image/gif"].includes(content)) {
        throw new error.BadRequest("given content type is not supported");
    }
    filename += '.' + content.slice(6); //add the file extention;

    const path = photoPath + filename;
    
    console.log(path);

    await req.pipe(fs.createWriteStream(path, { autoClose: true }));

    return filename;
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