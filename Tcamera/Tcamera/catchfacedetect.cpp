#include "catchfacedetect.h"
#include "cv_face.h"

using namespace cv;

CatchFaceDetect::CatchFaceDetect()
{

}

void CatchFaceDetect::catchFace(Mat&bgr_image)
{

    int points_size = 21;
    int config;
    if (points_size == 21) {
        config = CV_DETECT_ENABLE_ALIGN_21;
    }
    else if (points_size == 106) {
        config = CV_DETECT_ENABLE_ALIGN_106;
    }
    else {
        fprintf(stderr, "alignment point size error, must be 21 or 106\n");
        return;
    }

    // load image
    //bgr_image =srcImage.clone();             // CV_PIX_FMT_BGR888
    if (!bgr_image.data) {
        fprintf(stderr, "fail to read\n");//%s\n", input_image_path);
        return;
    }


    // init detect handle
    cv_handle_t handle_detect = NULL;
    cv_result_t cv_result = CV_OK;
    cv_face_t* p_face = NULL;
    int face_count = 0;
    do
    {
        cv_result = cv_face_create_detector(&handle_detect, NULL, config);
        if (cv_result != CV_OK) {
            fprintf(stderr, "cv_face_create_detector failed, error code %d\n", cv_result);
            break;
        }

        /*
         * test get and set threshold
         */
        float default_threshold;
        cv_result = cv_face_detect_get_threshold(handle_detect, &default_threshold);
        if (cv_result != CV_OK) {
            //fprintf(stderr, "cv_face_detect_get_threshold failed, error code %d\n", cv_result);
            break;
        }
        //fprintf(stderr, "default threshold : %f\n", default_threshold);

        cv_result = cv_face_detect_set_threshold(handle_detect, default_threshold);
        if (cv_result != CV_OK) {
            //fprintf(stderr, "cv_face_detect_set_threshold failed, error code %d\n", cv_result);
            break;
        }
        fprintf(stderr, "threshold set : %f\n", default_threshold);


        // detect

        cv_result = cv_face_detect(handle_detect, bgr_image.data, CV_PIX_FMT_BGR888,
            bgr_image.cols, bgr_image.rows, bgr_image.step,
            CV_FACE_UP, &p_face, &face_count);

        if (cv_result != CV_OK) {
            //fprintf(stderr, "cv_face_detect error %d\n", cv_result);
            break;
        }

        if (face_count > 0) {
            // draw result
            for (int i = 0; i < face_count; i++) {
                rectangle(bgr_image, Point(p_face[i].rect.left, p_face[i].rect.top),
                    Point(p_face[i].rect.right, p_face[i].rect.bottom),
                    Scalar(0, 255, 0), 2, 8, 0);
                //fprintf(stderr, "face number: %d\n", i + 1);
                /*fprintf(stderr, "face rect: [%d, %d, %d, %d]\n", p_face[i].rect.top,
                    p_face[i].rect.left,
                    p_face[i].rect.right, p_face[i].rect.bottom);*/
                //fprintf(stderr, "score: %f\n", p_face[i].score);
                /*fprintf(stderr, "face pose: [yaw: %.2f, pitch: %.2f, roll: %.2f, eye distance: %.2f]\n",
                    p_face[i].yaw,
                    p_face[i].pitch, p_face[i].roll, p_face[i].eye_dist);*/
                //fprintf(stderr, "face algin:\n");
                for (unsigned int j = 0; j < p_face[i].points_count; j++) {
                    float x = p_face[i].points_array[j].x;
                    float y = p_face[i].points_array[j].y;
                    //fprintf(stderr, "(%.2f, %.2f)\n", x, y);
                    circle(bgr_image, Point2f(x, y), 2, Scalar(0, 0, 255), -1);
                }
                //fprintf(stderr, "\n");
            }
            // save image
            //imwrite(output_image_path, bgr_image);
        }
        else {
            fprintf(stderr, "can't find face in image\n");// %s", input_image_path);
        }

    } while (0);


    // release the memory of face
    cv_face_release_detector_result(p_face, face_count);
    // destroy detect handle
    cv_face_destroy_detector(handle_detect);

    fprintf(stderr, "test finish!\n");
}
