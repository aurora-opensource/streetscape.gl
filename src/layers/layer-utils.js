import {loadTextures, Texture2D} from 'luma.gl';

/*
 * Load image data into luma.gl Texture2D objects
 * @param {WebGLContext} gl
 * @param {String|Texture2D|HTMLImageElement|Uint8ClampedArray} src - source of image data
 *   can be url string, Texture2D object, HTMLImageElement or pixel array
 * @returns {Promise} resolves to an object with name -> texture mapping
 */
export function getTexture(gl, src, opts) {
  if (typeof src === 'string') {
    // Url, load the image
    return loadTextures(gl, {urls: [src], ...opts})
      .then(textures => textures[0])
      .catch(error => {
        throw new Error(`Could not load texture from ${src}: ${error}`);
      });
  }
  return new Promise(resolve => resolve(getTextureFromData(gl, src, opts)));
}

/*
 * Convert image data into texture
 * @returns {Texture2D} texture
 */
export function getTextureFromData(gl, data, opts) {
  if (data instanceof Texture2D) {
    return data;
  }
  return new Texture2D(gl, {data, ...opts});
}
