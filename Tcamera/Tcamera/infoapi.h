#ifndef INFOAPI_H
#define INFOAPI_H

#include <QObject>

class InfoAPI : public QObject
{
    Q_OBJECT
public:
    explicit InfoAPI(QObject *parent = 0);

signals:

public slots:
    int test();
};

#endif // INFOAPI_H
