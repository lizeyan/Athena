#ifndef DETECTIONTHREAD_H
#define DETECTIONTHREAD_H

#include <QObject>
#include <QThread>
#include <QMutex>

class DetectionThread : public QThread
{
    Q_OBJECT
public:
    explicit DetectionThread(QObject *parent = 0);

    QString api_id;
    QString api_secret;

    QMutex writingLock;

    void run();

    bool isWriting;

    int faceCount;

signals:
    void newPerson(QString);

public slots:
};

#endif // DETECTIONTHREAD_H
