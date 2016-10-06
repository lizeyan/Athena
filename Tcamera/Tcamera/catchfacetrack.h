#ifndef CATCHFACETRACK_H
#define CATCHFACETRACK_H

#include "cv.h"
#include "highgui.h"
#include "opencv.hpp"
#include "cv_face.h"

using namespace cv;

class CatchFaceTrack
{
public:
    CatchFaceTrack();
    int open(Mat&);
    int catchFace(Mat&);
    ~CatchFaceTrack();

private:
    VideoCapture capture;

    int frame_width = capture.get(CV_CAP_PROP_FRAME_WIDTH);
    int frame_height = capture.get(CV_CAP_PROP_FRAME_HEIGHT);

    int point_size = 21;
    int config;
    cv_handle_t handle_track;
    cv_result_t cv_result;
};

#endif // CATCHFACETRACK_H
