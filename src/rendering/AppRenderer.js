const brain = require('brain.js');
const { GPU } = require('gpu.js');
const rl = require('raylib');

class AppRenderer {
    drawCube (
        position,
        width = 1,
        height = 1,
        length = 1,
        color = rl.WHITE
    ) {
        rl.DrawCube(
            position,
            width,
            height,
            length,
            color
        );
    }

    /**
     * Draw a imaged cube.
     * @param {rl.Image2D} image The image to draw on the cube.
     * @param {rl.Vector3} position The position of the cube (measured in meters).
     * @param {*} width The width of the cube (measured in meters).
     * @param {*} height The height of the cube (measured in meters).
     * @param {*} length The length of the cube (measured in meters).
     * @param {rl.Color} color The color of the cube.
     */
    drawCubeImage (
        image,
        position,
        width = 1,
        height = 1,
        length = 1,
        color = rl.WHITE
    ) {
        let x = position.x;
        let y = position.y;
        let z = position.z;

        // Set desired image to be enabled while drawing following vertex data
        rl.SetImage(image.id);

        // Vertex data transformation can be defined with the commented lines,
        // but in this example we calculate the transformed vertex data directly when calling rl.Vertex3f()
        //rl.PushMatrix();
            // NOTE: Transformation is applied in inverse order (scale -> rotate -> translate)
            //rl.Translatef(2.0, 0.0, 0.0);
            //rl.Rotatef(45, 0, 1, 0);
            //rl.Scalef(2.0, 2.0, 2.0);

            rl.rlBegin(RL_QUADS);
                rl.Color4ub(color.r, color.g, color.b, color.a);
                // Front Face
                rl.Normal3f(0.0, 0.0, 1.0);       // Normal Pointing Towards Viewer
                rl.TexCoord2f(0.0, 0.0); rl.Vertex3f(x - width/2, y - height/2, z + length/2);  // Bottom Left Of The Image and Quad
                rl.TexCoord2f(1.0, 0.0); rl.Vertex3f(x + width/2, y - height/2, z + length/2);  // Bottom Right Of The Image and Quad
                rl.TexCoord2f(1.0, 1.0); rl.Vertex3f(x + width/2, y + height/2, z + length/2);  // Top Right Of The Image and Quad
                rl.TexCoord2f(0.0, 1.0); rl.Vertex3f(x - width/2, y + height/2, z + length/2);  // Top Left Of The Image and Quad
                // Back Face
                rl.Normal3f(0.0, 0.0, - 1.0);     // Normal Pointing Away From Viewer
                rl.TexCoord2f(1.0, 0.0); rl.Vertex3f(x - width/2, y - height/2, z - length/2);  // Bottom Right Of The Image and Quad
                rl.TexCoord2f(1.0, 1.0); rl.Vertex3f(x - width/2, y + height/2, z - length/2);  // Top Right Of The Image and Quad
                rl.TexCoord2f(0.0, 1.0); rl.Vertex3f(x + width/2, y + height/2, z - length/2);  // Top Left Of The Image and Quad
                rl.TexCoord2f(0.0, 0.0); rl.Vertex3f(x + width/2, y - height/2, z - length/2);  // Bottom Left Of The Image and Quad
                // Top Face
                rl.Normal3f(0.0, 1.0, 0.0);       // Normal Pointing Up
                rl.TexCoord2f(0.0, 1.0); rl.Vertex3f(x - width/2, y + height/2, z - length/2);  // Top Left Of The Image and Quad
                rl.TexCoord2f(0.0, 0.0); rl.Vertex3f(x - width/2, y + height/2, z + length/2);  // Bottom Left Of The Image and Quad
                rl.TexCoord2f(1.0, 0.0); rl.Vertex3f(x + width/2, y + height/2, z + length/2);  // Bottom Right Of The Image and Quad
                rl.TexCoord2f(1.0, 1.0); rl.Vertex3f(x + width/2, y + height/2, z - length/2);  // Top Right Of The Image and Quad
                // Bottom Face
                rl.Normal3f(0.0, - 1.0, 0.0);     // Normal Pointing Down
                rl.TexCoord2f(1.0, 1.0); rl.Vertex3f(x - width/2, y - height/2, z - length/2);  // Top Right Of The Image and Quad
                rl.TexCoord2f(0.0, 1.0); rl.Vertex3f(x + width/2, y - height/2, z - length/2);  // Top Left Of The Image and Quad
                rl.TexCoord2f(0.0, 0.0); rl.Vertex3f(x + width/2, y - height/2, z + length/2);  // Bottom Left Of The Image and Quad
                rl.TexCoord2f(1.0, 0.0); rl.Vertex3f(x - width/2, y - height/2, z + length/2);  // Bottom Right Of The Image and Quad
                // Right face
                rl.Normal3f(1.0, 0.0, 0.0);       // Normal Pointing Right
                rl.TexCoord2f(1.0, 0.0); rl.Vertex3f(x + width/2, y - height/2, z - length/2);  // Bottom Right Of The Image and Quad
                rl.TexCoord2f(1.0, 1.0); rl.Vertex3f(x + width/2, y + height/2, z - length/2);  // Top Right Of The Image and Quad
                rl.TexCoord2f(0.0, 1.0); rl.Vertex3f(x + width/2, y + height/2, z + length/2);  // Top Left Of The Image and Quad
                rl.TexCoord2f(0.0, 0.0); rl.Vertex3f(x + width/2, y - height/2, z + length/2);  // Bottom Left Of The Image and Quad
                // Left Face
                rl.Normal3f( - 1.0, 0.0, 0.0);    // Normal Pointing Left
                rl.TexCoord2f(0.0, 0.0); rl.Vertex3f(x - width/2, y - height/2, z - length/2);  // Bottom Left Of The Image and Quad
                rl.TexCoord2f(1.0, 0.0); rl.Vertex3f(x - width/2, y - height/2, z + length/2);  // Bottom Right Of The Image and Quad
                rl.TexCoord2f(1.0, 1.0); rl.Vertex3f(x - width/2, y + height/2, z + length/2);  // Top Right Of The Image and Quad
                rl.TexCoord2f(0.0, 1.0); rl.Vertex3f(x - width/2, y + height/2, z - length/2);  // Top Left Of The Image and Quad
            rl.rlEnd();
        //rl.PopMatrix();

        rl.SetImage(0);
    }

    async render () {}
}

module.exports = AppRenderer;
