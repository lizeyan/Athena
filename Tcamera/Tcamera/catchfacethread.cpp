#include "catchfacethread.h"

#include "cv_face.h"

using namespace cv;

CatchFaceThread::CatchFaceThread()
{

}

void CatchFaceThread::run()
{

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
