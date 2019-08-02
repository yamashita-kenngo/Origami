import {
  make_faces_matrix,
  make_vertices_coords_folded
} from "../fold/make";

export const build_folded_frame = function (graph, face_stationary, frame_parent) {
  // this is not always the case. maybe shouldn't imply this here.
  if (frame_parent == null) {
    frame_parent = 0;
    console.warn("build_folded_frame was not supplied a stationary face");
  }
  if (face_stationary == null) {
    face_stationary = 0;
    console.warn("build_folded_frame was not supplied a stationary face");
  }
  // console.log("build_folded_frame", graph, face_stationary);
  const faces_matrix = make_faces_matrix(graph, face_stationary);
  const vertices_coords = make_vertices_coords_folded(graph, face_stationary, faces_matrix);
  return {
    vertices_coords,
    frame_classes: ["foldedForm"],
    frame_inherit: true,
    frame_parent,
    "faces_re:matrix": faces_matrix
  };
};

export const second_thing = 5;