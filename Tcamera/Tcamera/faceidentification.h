#ifndef FACEIDENTIFICATION_H
#define FACEIDENTIFICATION_H

#include <QObject>

class FaceIdentification : public QObject
{
    Q_OBJECT
public:
    explicit FaceIdentification(QObject *parent = 0);

signals:

public slots:
};

#endif // FACEIDENTIFICATION_H