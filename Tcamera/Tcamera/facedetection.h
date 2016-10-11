#ifndef FACEDETECTION_H
#define FACEDETECTION_H

#include <QObject>
#include <cstring>
#include <string>

class FaceDetection : public QObject
{
    Q_OBJECT
public:
    explicit FaceDetection(QObject *parent = 0);
signals:

public slots:
    int test();
};

#endif // FACEDETECTION_H
