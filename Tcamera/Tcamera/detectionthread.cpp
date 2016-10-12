#include "detectionthread.h"

#include "infoapi.h"

#include "facedetection.h"
#include "faceidentification.h"
#include "detectionthread.h"

DetectionThread::DetectionThread(QObject *parent) : QThread(parent)
{

}

void DetectionThread::run()
{
    //InfoAPI infoApi;
    //infoApi.test();

    for(;;)
    {
        this->sleep(1000);
        FaceDetection faceDetection;

        faceDetection.setApi_id(QString("332cc3d4d63e404693589ca02da83600"));
        faceDetection.setApi_secret(QString("72e68c866c34405c8491839da7ffd4d0"));

        faceDetection.test();

        FaceIdentification faceIdentification;

        faceIdentification.setApi_id(QString("332cc3d4d63e404693589ca02da83600"));
        faceIdentification.setApi_secret(QString("72e68c866c34405c8491839da7ffd4d0"));
        faceIdentification.setFace_id("ff7e13742b5b4021a943daf88793d1da");
        faceIdentification.setGroup_id("6c59b4c08e4d41d884118f3afc8fdb1b");

        faceIdentification.test();
    }
}
