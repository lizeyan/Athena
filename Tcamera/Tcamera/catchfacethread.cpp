#include "catchfacethread.h"

#include "cv_face.h"
#include "catchfacedetect.h"

using namespace cv;

CatchFaceThread::CatchFaceThread()
{

}

void CatchFaceThread::run()
{
    CatchFaceDetect detect;
    for(;;)
    {
        lock->lock();
        if(queue.empty())
        {
            lock->unlock();
            sleep(100);
        }
        else
        {
            lock->unlock();
            Mat now=queue[0];
            queue.pop_back();
            detect.catchFace(now);
        }
    }
}

void CatchFaceThread::add(Mat image)
{
    lock->lock();
    queue.push_back(image);
    lock->unlock();
}

void CatchFaceThread::setLock(QMutex*lockFromParent)
{
    lock=lockFromParent;
}
