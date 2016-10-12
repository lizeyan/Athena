#ifndef FACEIDENTIFICATION_H
#define FACEIDENTIFICATION_H

#include <QObject>

class FaceIdentification : public QObject
{
    Q_OBJECT
public:
    explicit FaceIdentification(QObject *parent = 0);

    QString api_id,api_secret,group_id,face_id;

    QString result;

    void setApi_id(QString);
    void setApi_secret(QString);
    void setGroup_id(QString);
    void setFace_id(QString);

signals:

public slots:
    int test();
};

#endif // FACEIDENTIFICATION_H
