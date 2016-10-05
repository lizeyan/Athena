#ifndef CATCHFACETHREAD_H
#define CATCHFACETHREAD_H

#include <QThread>
#include <QMutex>
#include <QVector>

#include "highgui.h"
#include "cv.h"

using namespace cv;


class CatchFaceThread : public QThread
{

public:
    CatchFaceThread();

    QVector<Mat>queue;

    QMutex *lock;

    void setLock(QMutex*);

    void run();

    void add(Mat);

};

#endif // CATCHFACETHREAD_H
