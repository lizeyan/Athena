#ifndef CATCHFACEDETECT_H
#define CATCHFACEDETECT_H

#include "highgui.h"
#include "cv.h"
#include "opencv.hpp"

using namespace cv;

class CatchFaceDetect
{
public:
    CatchFaceDetect();

    int catchFace(Mat&);

};

#endif // CATCHFACEDETECT_H
