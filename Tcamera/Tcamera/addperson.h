#ifndef ADDPERSON_H
#define ADDPERSON_H

#include <QObject>
#include <QtNetwork/QNetworkReply>

#include "HttpGet.h"

class AddPerson : public QObject
{
    Q_OBJECT
public:
    explicit AddPerson(QObject *parent = 0);

    int test();

    QString api_ID;
    QString api_secret;


signals:

public slots:

};

#endif // ADDPERSON_H
