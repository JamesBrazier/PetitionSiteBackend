const fs = require("mz/fs");
const error = require("./error.middleware");

const photoPath = "storage/photos/";

/**
 * @description saves the body of the given request as a photo file
 * @param {Request} req the http request
 * @param {String} filename the name for the file, the extention is added automatically
 * @returns {String} the full filename (with extention)
 */
exports.saveBodyPhoto = async function(req, filename)
{
    let content = req.get("Content-Type");

    if (!["image/png", "image/jpeg", "image/gif"].includes(content)) {
        throw new error.BadRequest("given content type is not supported");
    }
    filename += '.' + content.slice(6); //add the file extention;

    const path = photoPath + filename;
    
    console.log(path);

    await req.pipe(fs.createWriteStream(path, { autoClose: true })); //stream the body to a file and auto close stream

    return filename;
}

/**
 * @description loads the given photofile
 * @param {String} filename the full filename to load
 * @returns {Object} the pair of MIME *type* and image *data*
 */
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

/**
 * @description deletes the given photo file
 * @param {String} filename the file to remove
 */
exports.deletePhoto = function(filename)
{
    return exports.delete(photoPath + filename);
}

/**
 * @description deletes the given file
 * @param {String} filePath the path to the file to remove
 */
exports.delete = async function(filePath) 
{
    try {
        await fs.unlink(filePath);
    } catch (err) {
        throw new error.NotFound(err.message);
    }
}