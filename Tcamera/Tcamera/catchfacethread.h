#ifndef CATCHFACETHREAD_H
#define CATCHFACETHREAD_H

#include <QThread>


class CatchFaceThread : public QThread
{
public:
    CatchFaceThread();
    void run();
};

#endif // CATCHFACETHREAD_H
