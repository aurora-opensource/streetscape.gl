import * as d3 from 'd3-fetch';
import OBJ from 'webgl-obj-loader';
import {experimental} from 'math.gl';
const {Pose} = experimental;

export function loadOBJMesh(url) {
  return d3.text(url).then(text => {
    const mesh = new OBJ.Mesh(text);
    const indices = new Uint16Array(mesh.indices);
    const positions = new Float32Array(mesh.vertices);
    const normals = new Float32Array(mesh.vertexNormals);
    const texCoords = new Float32Array(mesh.textures);
    return {indices, positions, normals, texCoords};
  });
}

export function loadTimeslices(path) {
  const url = `${path}/timestamps.txt`;

  return d3
    .text(url)
    .then(text =>
      text
        .split('\n')
        .filter(Boolean)
        .map((line, i) => {
          return {
            index: i,
            filename: String(i).padStart(10, '0'),
            date: line,
            timestamp: Date.parse(`${line} GMT`)
          };
        })
    )
    .catch(err => {
      console.error(err);
      return null;
    });
}

export function loadTracklets(path) {
  const url = `${path}.xml`;

  return d3
    .xml(url)
    .then(xml => {
      // Convert to JSON

      const nodeToJSON = node => {
        const result = {};
        const childCount = node.children.length;

        if (childCount === 0) {
          return isFinite(node.textContent) ? Number(node.textContent) : node.textContent;
        }

        for (let i = 0; i < childCount; i++) {
          const childNode = node.children[i];
          const tagName = childNode.tagName;
          if (tagName in result) {
            if (!Array.isArray(result[tagName])) {
              result[tagName] = [result[tagName]];
            }
            result[tagName].push(nodeToJSON(childNode));
          } else {
            result[tagName] = nodeToJSON(childNode);
          }
        }
        return result;
      };

      return nodeToJSON(xml);
    })
    .then(json => {
      // Sort
      const timeslices = [];

      json.boost_serialization.tracklets.item.forEach(item => {
        const itemProps = {
          objectType: item.objectType,
          width: item.w,
          height: item.h,
          length: item.l
        };
        const bounds = [
          [-item.l / 2, -item.w / 2],
          [-item.l / 2, item.w / 2],
          [item.l / 2, item.w / 2],
          [item.l / 2, -item.w / 2],
          [-item.l / 2, -item.w / 2]
        ];
        let frameIndex = item.first_frame;

        item.poses.item.forEach(pose => {
          timeslices[frameIndex] = timeslices[frameIndex] || [];
          const transformMatrix = new Pose({
            x: pose.tx,
            y: pose.ty,
            z: pose.tz,
            roll: pose.rx,
            pitch: pose.ry,
            yaw: pose.rz
          }).getTransformationMatrix();

          timeslices[frameIndex].push({
            ...itemProps,
            ...pose,
            polygon: bounds.map(p => transformMatrix.transformVector(p))
          });
          frameIndex++;
        });
      });

      return timeslices;
    })
    .catch(err => {
      console.error(err);
      return null;
    });
}

export function loadPointCloud(path, filename) {
  const url = `${path}/data/${filename}.bin`;

  return d3
    .buffer(url)
    .then(binary => {
      const float = new Float32Array(binary);
      const size = float.length / 4;

      const positions = new Float32Array(size * 3);
      const normals = new Float32Array(size * 3);
      const colors = new Uint8ClampedArray(size * 4);

      for (let i = 0; i < size; i++) {
        positions[i * 3] = float[i * 4];
        positions[i * 3 + 1] = float[i * 4 + 1];
        positions[i * 3 + 2] = float[i * 4 + 2];
        const a = float[i * 4 + 3];

        normals[i * 3 + 2] = 1;

        colors[i * 4 + 0] = 50;
        colors[i * 4 + 1] = 50 + 100 * a;
        colors[i * 4 + 2] = 50 + 200 * a;
        colors[i * 4 + 3] = 255;
      }
      return {size, positions, normals, colors};
    })
    .catch(err => {
      console.error(err);
      return null;
    });
}

export function loadImage(path, filename) {
  const url = `${path}/data/${filename}.png`;

  return Promise.resolve(url);
}

const vehiclePoseColumns = 'latitude longitude altitude roll pitch yaw vn ve vf vl vu ax ay ay af al au wx wy wz wf wl wu pos_accuracy vel_accuracy navstat numsats posmode velmode orimode'.split(
  ' '
);

export function loadVehiclePose(path, filename) {
  const url = `${path}/data/${filename}.txt`;

  return d3
    .text(url)
    .then(text => {
      const pose = {};
      text.split(' ').forEach((t, i) => {
        pose[vehiclePoseColumns[i]] = Number(t);
      });
      return pose;
    })
    .catch(err => {
      console.error(err);
      return null;
    });
}
