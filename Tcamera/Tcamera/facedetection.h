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

    QString api_id,api_secret,face;
    void setApi_id(QString);
    void setApi_secret(QString);
    void setFace(QString);
    QString result;
signals:

public slots:
    int test();
};

#endif // FACEDETECTION_H
