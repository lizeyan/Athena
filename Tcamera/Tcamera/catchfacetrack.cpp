#include "catchfacetrack.h"


CatchFaceTrack::CatchFaceTrack()
{

}

CatchFaceTrack::~CatchFaceTrack()
{
    // destroy track handle
    cv_face_destroy_tracker(handle_track);
}

int CatchFaceTrack::open(Mat&bgr_frame)
{
    // open the camera
    if(!capture.open(1))
    {
        capture.open(0);
        if (!capture.isOpened()) {
            fprintf(stderr, "can not open camera!\n");
            return 0;
        }
    }

    frame_width = capture.get(CV_CAP_PROP_FRAME_WIDTH);
    frame_height = capture.get(CV_CAP_PROP_FRAME_HEIGHT);

    point_size = 21;

    if (point_size == 21) {
        config = CV_DETECT_ENABLE_ALIGN_21;
    }
    else if (point_size == 106) {
        config = CV_DETECT_ENABLE_ALIGN_106;
    }
    else {
        fprintf(stderr, "alignment point size must be 21 or 106\n");
        return 0;
    }

    handle_track = NULL;
    cv_result = CV_OK;
    // init handle
    cv_result = cv_face_create_tracker(&handle_track, NULL, config | CV_FACE_TRACKING_TWO_THREAD);
    if (cv_result != CV_OK) {
        fprintf(stderr, "cv_face_create_tracker failed, error code %d\n", cv_result);
        return 0;
    }
    int detect_face_cnt_limit = 16;
    if (detect_face_cnt_limit < -1) {
        detect_face_cnt_limit = -1;
    }
    int val = 0;
    cv_result = cv_face_track_set_detect_face_cnt_limit(handle_track, detect_face_cnt_limit, &val);
    if (cv_result != CV_OK) {
        fprintf(stderr, "cv_face_track_set_detect_face_cnt_limit failed, error : %d\n", cv_result);
        return 0;
    } else {
        fprintf(stderr, "detect face count limit : %d\n", val);
    }

    bgr_frame= Mat::zeros(frame_height, frame_width, CV_8UC3);

    return 1;
}

int CatchFaceTrack::catchFace(Mat&bgr_frame)
{

    cv_face_t *p_face = NULL;
    int face_count = 0;
    capture>>bgr_frame;
    // realtime track
    face_count = 0;
    cv_result = cv_face_track(handle_track, bgr_frame.data, CV_PIX_FMT_BGR888,
        bgr_frame.cols, bgr_frame.rows, bgr_frame.step,
        CV_FACE_UP, &p_face, &face_count);
    if (cv_result != CV_OK) {
        fprintf(stderr, "cv_face_track failed, error : %d\n", cv_result);
        cv_face_release_tracker_result(p_face, face_count);
        return 0;
    }

    for (int i = 0; i < face_count; i++) {
        //fprintf(stderr, "face: %d-----[%d, %d, %d, %d]-----id: %d\n", i,
        //    p_face[i].rect.left, p_face[i].rect.top,
        //    p_face[i].rect.right, p_face[i].rect.bottom, p_face[i].ID);
        //fprintf(stderr, "face pose: [yaw: %.2f, pitch: %.2f, roll: %.2f, eye distance: %.2f]\n",
        //    p_face[i].yaw,
        //    p_face[i].pitch, p_face[i].roll, p_face[i].eye_dist);

        // draw the video
        Scalar scalar_color = CV_RGB(p_face[i].ID * 53 % 256,
            p_face[i].ID * 93 % 256,
            p_face[i].ID * 143 % 256);
        rectangle(bgr_frame, Point2f(static_cast<float>(p_face[i].rect.left),
            static_cast<float>(p_face[i].rect.top)),
            Point2f(static_cast<float>(p_face[i].rect.right),
            static_cast<float>(p_face[i].rect.bottom)), scalar_color, 2);
        for (int j = 0; j < p_face[i].points_count; j++) {
            circle(bgr_frame, Point2f(p_face[i].points_array[j].x,
                p_face[i].points_array[j].y), 1, Scalar(0, 255, 0));
        }
    }

    // release the memory of face
    cv_face_release_tracker_result(p_face, face_count);
    //imshow("TrackingTest", bgr_frame);
    /*if (waitKey(1) != -1)
        break;*/

    return face_count;
}
