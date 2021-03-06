// there's not much order right now other than adding tests as i think of them
// this should be thorough at the cost of speed.
// currently only enforcing graph combinatorics, doesn't check things like
// illegal planar graph edge crossings.. that will probably be
// its own validate.

import { keys, edges_assignment_values } from "./keys";

export const arrayOfType = function (array, type = "number") {
  let test = true;
  array.forEach((a) => {
    if (typeof a !== type) {
      test = false;
      return; // break from forEach somehow
    }
  });
  return test;
};

export const arrayOfArrayOfType = function (array, type = "number") {
  let test = true;
  array.forEach((arr) => {
    arr.forEach((a) => {
      if (typeof a !== type) {
        test = false;
        return; // break from forEach somehow
      }
    });
  });
  return test;
};

const arrayOfArrayOfIsNotNaN = function (array) {
  return array
    .map(arr => arr
      .map(n => !isNaN(n))
      .reduce((a, b) => a && b, true))
    .reduce((a, b) => a && b, true);
};

const arrayOfArrayCompareFunc = function (array, func) {
  return array
    .map(arr => arr
      .map(n => func(n))
      .reduce((a, b) => a && b, true))
    .reduce((a, b) => a && b, true);
};

const Validate = {};

Validate.vertices_coords = function ({ vertices_coords }) {
  return vertices_coords != null
    && arrayOfArrayOfType(vertices_coords, "number")
    && arrayOfArrayOfIsNotNaN(vertices_coords);
};

Validate.vertices_vertices = function ({ vertices_coords, vertices_vertices, edges_vertices }) {
  // vertices_vertices should contain twice the number of edges.
  if (vertices_vertices == null) { return false; }
  const vert_vert_count = vertices_vertices.map(a => a.length).reduce((a, b) => a + b, 0);
  if (Math.abs(vert_vert_count * 1 - edges_vertices.length * 2) > 1) {
    console.warn("Validate.vertices_vertices, expected array length deviated by more than 1");
  }

  if (vertices_vertices != null) {
    if (vertices_vertices.length !== vertices_coords.length) { return false; }
    const vv_edge_test = vertices_vertices
      .map((vv, i) => vv.map(v2 => [i, v2]))
      .reduce((a, b) => a.concat(b), []);
    return vv_edge_test
      .map(ve => edges_vertices.filter(e => (ve[0] === e[0]
        && ve[1] === e[1]) || (ve[0] === e[1] && ve[1] === e[0])).length > 0)
      .map((b, i) => ({ test: b, i }))
      .filter(el => !el.test)
      .length === 0;
  }
  return false;
};

Validate.vertices_faces = function ({ vertices_faces, faces_vertices }) {
  return faces_vertices != null
    && vertices_faces != null
    && vertices_faces
      .map((vert, i) => vert
        .map(vf => ({
          test: faces_vertices[vf].indexOf(i) !== -1,
          face: vf,
          i
        }))
        .filter(el => !el.test))
      .reduce((a, b) => a.concat(b), [])
      .length === 0;
};

Validate.edges_vertices = function ({ vertices_coords, edges_vertices }) {
  // nothing to compare against, valid
  if (vertices_coords == null) { return true; }
  const vert_size = vertices_coords.length;
  return edges_vertices != null
    && arrayOfArrayOfType(edges_vertices, "number")
    && arrayOfArrayOfIsNotNaN(edges_vertices)
    && arrayOfArrayCompareFunc(edges_vertices, n => n < vert_size);
};

Validate.edges_faces = function ({ edges_faces, faces_edges }) {
  return false;
  // return faces_edges != null
  //   && edges_faces
  //     .map((edge, i) => edge
  //       .map(ef => ({
  //         test: faces_edges[ef].indexOf(i) !== -1,
  //         face: ef,
  //         i
  //       }))
  //       .filter(el => !el.test))
  //     .reduce((a, b) => a.concat(b), [])
  //     .length === 0;
};

Validate.faces_faces = function (graph) {
  return false;
};

Validate.vertices_edges = function (graph) {
  return false;
};

/**
 * validate edges_assignment only
 * @returns {boolean} true, if and only if "edges_assignment" is present and
 * its length matches edges_vertices and it contains only valid entries
 */
Validate.edges_assignment = function ({ edges_vertices, edges_assignment }) {
  return edges_vertices != null
    && edges_assignment != null
    && edges_assignment.length === edges_vertices.length
    && edges_assignment
      .filter(v => edges_assignment_values.includes(v))
      .reduce((a, b) => a && b, true);
};

Validate.edges_foldAngle = function (graph) {
  return false;
};

Validate.edges_length = function (graph) {
  return false;
};

Validate.faces_vertices = function ({ vertices_faces, faces_vertices }) {
  if (vertices_faces != null) {
    return faces_vertices
      .map((face, i) => face
        .map(vf => ({
          test: vertices_faces[vf].indexOf(i) !== -1,
          face: vf,
          i
        }))
        .filter(el => !el.test))
      .reduce((a, b) => a.concat(b), [])
      .length === 0;
  }
  return false;
};

Validate.faces_edges = function (graph) {
  return false;
};

/**
 * determine if an object is possibly a FOLD format graph.
 * the certainty is (if it is an object), how many of its keys are
 * FOLD spec keys, percentage-wise
 * @returns {number} 0 to 1, 1 being most certain it IS a FOLD format.
 */
export const possibleFoldObject = function (input) {
  if (typeof input !== "object" || input === null) { return 0; }
  const inputKeys = Object.keys(input);
  if (inputKeys.length === 0) { return 0; }
  return inputKeys.map(key => keys.includes(key))
    .reduce((a, b) => a + (b ? 1 : 0), 0) / inputKeys.length;
};

export default Validate;

/**
 * validate the entire graph, run every validate operation we have
 */
export const validate_first = function (graph) {
  const prefix_suffix = {
    vertices: ["coords", "vertices", "faces"],
    edges: ["vertices", "faces", "assignment", "foldAngle", "length"],
    faces: ["vertices", "edges"],
  };

  // check for nulls
  ["vertices_coords", "vertices_vertices", "vertices_faces",
    "edges_vertices", "edges_faces",
    "faces_vertices", "faces_edges"].filter(a => a in graph).forEach((key) => {
    if (graph[key]
      .map(a => a.filter(b => b == null).length > 0)
      .reduce((a, b) => a || b, false)) {
      throw new Error(`${key} contains a null`);
    }
  });
  ["edges_assignment", "edges_foldAngle", "edges_length"].filter(a => a in graph).forEach((key) => {
    if (graph[key].filter(a => a == null).length > 0) {
      throw new Error(`${key} contains a null`);
    }
  });

  // all arrays with similar prefixes should be of the same length
  const arraysLengthTest = Object.keys(prefix_suffix)
    .map(key => ({ prefix: key, suffixes: prefix_suffix[key] }))
    .map(el => el.suffixes
      .map(suffix => `${el.prefix}_${suffix}`)
      .filter(key => graph[key] != null)
      .map((key, _, arr) => graph[key].length === graph[arr[0]].length)
      .reduce((a, b) => a && b, true))
    .reduce((a, b) => a && b, true);

  if (!arraysLengthTest) {
    throw new Error("validate failed: arrays with common keys have mismatching lengths");
  }

  const l = {
    vertices: graph.vertices_coords.length,
    edges: graph.edges_vertices.length,
    faces: graph.faces_vertices.length || graph.faces_edges.length
  };
  // geometry indices point to arrays longer than that index value
  const arraysIndexTest = Object.keys(prefix_suffix)
    .map(key => ({ prefix: key, suffixes: prefix_suffix[key] }))
    .map(el => el.suffixes
      .map(suffix => ({ key: `${el.prefix}_${suffix}`, suffix }))
      .filter(ell => graph[ell.key] != null && l[ell.suffix] != null)
      .map(ell => ({
        key: ell.key,
        test: graph[ell.key]
          .reduce((prev, curr) => curr
            .reduce((a, b) => a && (b < l[ell.suffix]), true), true)
      })))
    .reduce((a, b) => a.concat(b), []);

  arraysIndexTest
    .filter(el => !el.test)
    .forEach((el) => {
      console.log(graph);
      throw new Error(`${el.key} contains a index too large, larger than the reference array to which it points`);
    });

  // iterate over every vertices_vertices, check that the pairing of vertices
  // exists somewhere in edges_vertices
  // this assumes that vertices_vertices implies the presence of edges_vertices
  if ("vertices_vertices" in graph) {
    const vv_edge_test = graph.vertices_vertices
      .map((vv, i) => vv.map(v2 => [i, v2]))
      .reduce((a, b) => a.concat(b), []);
    const ev_test_fails = vv_edge_test
      .map(ve => graph.edges_vertices.filter(e => (ve[0] === e[0]
        && ve[1] === e[1]) || (ve[0] === e[1] && ve[1] === e[0])).length > 0)
      .map((b, i) => ({ test: b, i }))
      .filter(el => !el.test);

    if (ev_test_fails.length > 0) {
      throw new Error(`vertices_vertices at index ${ev_test_fails[0].i} declares an edge that doesn't exist in edges_vertices`);
    }
  }

  if ("vertices_faces" in graph) {
    const v_f_test = graph.vertices_faces
      .map((vert, i) => vert
        .map(vf => ({
          test: graph.faces_vertices[vf].indexOf(i) !== -1,
          face: vf,
          i
        }))
        .filter(el => !el.test))
      .reduce((a, b) => a.concat(b), []);

    if (v_f_test.length > 0) {
      throw new Error(`vertex ${v_f_test[0].i} in vertices_faces connects to face ${v_f_test[0].face}, whereas in faces_vertices this same connection in reverse doesn't exist.`);
    }
  }
  if ("edges_faces" in graph) {
    const e_f_test = graph.edges_faces
      .map((edge, i) => edge
        .map(ef => ({
          test: graph.faces_edges[ef].indexOf(i) !== -1,
          face: ef,
          i
        }))
        .filter(el => !el.test))
      .reduce((a, b) => a.concat(b), []);

    if (e_f_test.length > 0) {
      throw new Error(`edges_faces ${e_f_test[0].i} connects to face ${e_f_test[0].face}, whereas in faces_edges this same connection in reverse doesn't exist.`);
    }
  }

  if ("faces_vertices" in graph && "vertices_faces" in graph) {
    const f_v_test = graph.faces_vertices
      .map((face, i) => face
        .map(vf => ({
          test: graph.vertices_faces[vf].indexOf(i) !== -1,
          face: vf,
          i
        }))
        .filter(el => !el.test))
      .reduce((a, b) => a.concat(b), []);
  }

  // "vertices_coords"
  // "vertices_vertices"
  // "vertices_faces"
  // "edges_vertices"
  // "edges_faces"
  // "edges_assignment"
  // "edges_foldAngle"
  // "edges_length"
  // "faces_vertices"
  // "faces_edges"

  return true;
};
